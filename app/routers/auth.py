from fastapi import status, HTTPException, Depends, APIRouter
from sqlalchemy.orm import Session
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from .. import models, schemas, utils
from ..database import get_db
from  . import oauth2

router = APIRouter()

@router.post('/login')
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                            detail=f"invalid credentials")
    
    if not utils.verify(user_credentials.password,user.password):
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                            detail=f"invalid credentials")   
    

    # create a token
    # retur token

    access_token = oauth2.create_access_token(data = {"user_id": user.id})
    return {"access_token": access_token, "token_type":"bearer"}