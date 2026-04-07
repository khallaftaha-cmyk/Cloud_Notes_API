from fastapi import FastAPI
from . import models
from .database import engine
from .routers import note, user, auth, ai
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Cloud Notes API", version="1.0.0")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai.router)
app.include_router(note.router)
app.include_router(user.router)
app.include_router(auth.router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}