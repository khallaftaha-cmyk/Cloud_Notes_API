from .database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, ARRAY
from sqlalchemy.sql import func, text
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())


class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, nullable=False)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    tags = Column(ARRAY(String), nullable=False, server_default=text("'{}'"))
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False,
                    server_default=func.now(), server_onupdate=FetchedValue())
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    owner = relationship("User")