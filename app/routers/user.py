from fastapi import status, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
from .. import models, schemas , utils
from ..database import get_db
from sqlalchemy.exc import IntegrityError


router = APIRouter()

@router.post("/users",status_code=status.HTTP_201_CREATED, response_model=schemas.UserRead)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):

    hashed_password = utils.hash(user.password)
    user.password = hashed_password

    new_user= models.User(**user.dict())
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

    except IntegrityError:
        db.rollback() 
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, 
                            detail=f"User with email: {user.email} already exists")

    return new_user

@router.get("/users/{id}", response_model=schemas.UserRead)
def read_user(id: int,  db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id ==id).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail=f"the user with the id:{id} was no found")

    return user