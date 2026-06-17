import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from . import oauth2
from .. import ai_service

router = APIRouter(
    prefix="/notes",
    tags=["AI"],
)

@router.post("/{id}/summarize", response_model=schemas.NoteSummaryResponse)
def summarize_note(
    id: int,
    db:Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    note = _get_owned_note(id, current_user, db)
    summary = ai_service.summarise_note(note)
    return schemas.NoteSummaryResponse(note_id=id, summary=summary)

@router.post("/{id}/tags", response_model=schemas.NoteTagsResponse)
def tag_note(
    id:int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    note = _get_owned_note(id, current_user, db)
    
    try:
        tags = ai_service.generate_tags(note)
    except(json.JSONDecodeError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI returned an unexpected response. Please try again"
        )
    
    note.tags = tags
    db.commit()
    db.refresh(note)

    return schemas.NoteTagsResponse(note_id=id, tags=tags)

@router.post("/generate", response_model=schemas.NoteGenerateResponse)
def generate_note(
    request: schemas.NoteGenerateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    try:
        draft = ai_service.generate_note_draft(request.prompt, request.title)
    except:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI returned an unexpected response. Please try again"
        )
    
    return schemas.NoteGenerateResponse(**draft)


@router.post("/ask", response_model=schemas.NoteAskResponse)
def ask_notes(
    request: schemas.NoteAskRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    notes = (
        db.query(models.Note)
        .filter(models.Note.owner_id == current_user.id).all()
    )
    result = ai_service.ask_notes(request.question, notes)
    return schemas.NoteAskResponse(**result)


def _get_owned_note(
        id:int,
        current_user: models.User, db:Session
) -> models.Note:
    note = db.query(models.Note).filter(models.Note.id == id).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id {id} was not found",
        )
    if note.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Not authorized to perform this action"
        )
    
    return note




