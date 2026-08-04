"""
ai_service.py
~~~~~~~~~~~~~
All Claude API interactions for Cloud Notes.
Kept separate from routing so logic is reusable and easy to test.
"""
import json
from typing import List
from . import models
from .config import settings
import anthropic

# Initialise once — explicitly pass the API key from settings
_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

MODEL = "claude-3-5-sonnet-20241022"


# ── Helpers ────────────────────────────────────────────────────────────────────

def _text(response: anthropic.types.Message) -> str:
    """Extract the plain text from a Claude response."""
    return response.content[0].text.strip()


def _notes_context(notes: List[models.Note]) -> str:
    """Format a list of notes into a numbered context block for Claude."""
    return "\n\n".join(
        f"[Note {n.id}] Title: {n.title}\n{n.content}" for n in notes
    )


# ── Feature 1 — Summarise ─────────────────────────────────────────────────────

def summarise_note(note: models.Note) -> str:
    """Return a concise summary of a single note."""
    response = _client.messages.create(
        model=MODEL,
        max_tokens=300,
        system=(
            "You are a helpful assistant that summarises personal notes. "
            "Respond with a single, concise paragraph (3-5 sentences max). "
            "No preamble, no bullet points — just the summary."
        ),
        messages=[
            {
                "role": "user",
                "content": f"Title: {note.title}\n\n{note.content}",
            }
        ],
    )
    return _text(response)


# ── Feature 2 — Auto-tag ──────────────────────────────────────────────────────

def generate_tags(note: models.Note) -> List[str]:
    """Return 2-5 short, lowercase topic tags for a note."""
    response = _client.messages.create(
        model=MODEL,
        max_tokens=100,
        system=(
            "You are a tagging assistant for personal notes. "
            "Given a note, respond ONLY with a JSON array of 2-5 lowercase, "
            "single-word or hyphenated tags. Example: [\"work\", \"meeting\", \"follow-up\"]. "
            "No explanation, no markdown — only the raw JSON array."
        ),
        messages=[
            {
                "role": "user",
                "content": f"Title: {note.title}\n\n{note.content}",
            }
        ],
    )
    raw = _text(response)
    tags: List[str] = json.loads(raw)
    # Sanitise: lowercase, strip whitespace, max 5
    return [t.lower().strip() for t in tags[:5]]


# ── Feature 3 — Generate draft ────────────────────────────────────────────────

def generate_note_draft(prompt: str, suggested_title: str | None = None) -> dict:
    """
    Generate a note title + content from a free-form prompt.
    Returns {"title": str, "content": str}.
    """
    title_hint = f"Suggested title: {suggested_title}\n" if suggested_title else ""

    response = _client.messages.create(
        model=MODEL,
        max_tokens=800,
        system=(
            "You are a writing assistant that drafts personal notes. "
            "Respond ONLY with a JSON object containing two keys: "
            "\"title\" (a short, descriptive title) and \"content\" (the note body in plain text). "
            "No markdown wrapping, no explanation — only the raw JSON object."
        ),
        messages=[
            {
                "role": "user",
                "content": f"{title_hint}Prompt: {prompt}",
            }
        ],
    )
    raw = _text(response)
    result = json.loads(raw)
    return {"title": result["title"], "content": result["content"]}


# ── Feature 4 — Ask across notes (RAG-lite) ───────────────────────────────────

def ask_notes(question: str, notes: List[models.Note]) -> dict:
    """
    Answer a question using the user's notes as context.
    Returns {"answer": str, "relevant_note_ids": List[int]}.
    """
    if not notes:
        return {
            "answer": "You don't have any notes yet. Create some notes first!",
            "relevant_note_ids": [],
        }

    context = _notes_context(notes)

    response = _client.messages.create(
        model=MODEL,
        max_tokens=600,
        system=(
            "You are a personal assistant with access to a user's notes. "
            "Answer the user's question using ONLY information found in the notes provided. "
            "If the answer is not in the notes, say so clearly. "
            "At the end of your answer, add a line: "
            "SOURCES: [comma-separated note IDs you used, e.g. 3,7,12]. "
            "If no notes were relevant, write SOURCES: none."
        ),
        messages=[
            {
                "role": "user",
                "content": (
                    f"My notes:\n\n{context}\n\n"
                    f"Question: {question}"
                ),
            }
        ],
    )

    full_text = _text(response)

    # Parse the SOURCES line out of the answer
    answer = full_text
    relevant_ids: List[int] = []
    if "SOURCES:" in full_text:
        parts = full_text.rsplit("SOURCES:", 1)
        answer = parts[0].strip()
        sources_raw = parts[1].strip()
        if sources_raw.lower() != "none":
            for token in sources_raw.split(","):
                token = token.strip()
                if token.isdigit():
                    relevant_ids.append(int(token))

    return {"answer": answer, "relevant_note_ids": relevant_ids}