import os
import threading

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI()
_model: SentenceTransformer | None = None
_model_ready = threading.Event()


def _load_model() -> None:
    global _model
    _model = SentenceTransformer(
        "intfloat/multilingual-e5-large",
        device=os.getenv("DEVICE", "cpu"),
    )
    _model_ready.set()


@app.on_event("startup")
def startup() -> None:
    threading.Thread(target=_load_model, daemon=True).start()


@app.get("/health")
def health() -> dict[str, str]:
    if not _model_ready.is_set():
        raise HTTPException(status_code=503, detail="Model loading")
    return {"status": "ok"}


class EmbeddingRequest(BaseModel):
    text: str
    query: bool


@app.post("/embed")
def embed(req: EmbeddingRequest) -> dict[str, list[float]]:
    if not _model_ready.is_set() or _model is None:
        raise HTTPException(status_code=503, detail="Model loading")
    prefix = "query: " if req.query else "passage: "
    embedding = _model.encode(prefix + req.text, normalize_embeddings=True)
    return {"embedding": embedding.tolist()}
