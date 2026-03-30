from fastapi import Response, status, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from . import oauth2

router = APIRouter(
    prefix="/notes",
    tags=['Notes']
)


@router.get("/", response_model=List[schemas.NoteRead])
def get_notes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
    skip: int = 0,
    limit: int = 20,
):
    notes = (
        db.query(models.Note)
        .filter(models.Note.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return notes


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.NoteRead)
def create_note(
    note: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    new_note = models.Note(owner_id=current_user.id, **note.model_dump())
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note


@router.get("/{id}", response_model=schemas.NoteRead)
def get_note( 
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    note = db.query(models.Note).filter(models.Note.id == id).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id {id} was not found",
        )

    if note.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform requested action",
        )

    return note


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    note_query = db.query(models.Note).filter(models.Note.id == id)
    note = note_query.first()

    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id {id} was not found",
        )

    if note.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform this action",
        )

    note_query.delete(synchronize_session=False)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/{id}", response_model=schemas.NoteRead)
def update_note(
    id: int,
    updated_note: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    note_query = db.query(models.Note).filter(models.Note.id == id)
    note = note_query.first()

    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id {id} was not found",
        )

    if note.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform this action",
        )

    note_query.update(updated_note.model_dump(), synchronize_session=False)
    db.commit()

    return note_query.first()
