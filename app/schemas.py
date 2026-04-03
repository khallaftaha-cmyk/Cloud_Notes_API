from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserRead(BaseModel):
    email: EmailStr
    id: int
    created_at: datetime
    password: str

class NoteCreate(BaseModel):
    title: str
    content: str

class NoteRead(BaseModel):
    id: int
    title: str
    content: str
    owner_id: int
    created_at: datetime
    updated_at: datetime
    tags: Optional[List[str]] = []

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    id: Optional[int] = None


class NoteSummaryResponse(BaseModel):
    note_id: int
    summary: str


class NoteGenerateRequest(BaseModel):
    prompt: str
    title: Optional[str] = None


class NoteGenerateResponse(BaseModel):
    title: str
    content: str


class NoteAskRequest(BaseModel):
    question:str


class NoteAskResponse(BaseModel):
    answer: str
    relevant_note_ids: List[int]


class NoteTagsResponse(BaseModel):
    note_id: int
    tags: List[str]




