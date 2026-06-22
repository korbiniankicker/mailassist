import os
import threading

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import CrossEncoder

app = FastAPI()
_model: CrossEncoder | None = None
_model_ready = threading.Event()


def _load_model() -> None:
    global _model
    _model = CrossEncoder(
        "cross-encoder/ms-marco-MiniLM-L-6-v2",
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


class RerankRequest(BaseModel):
    query: str
    documents: list[str]


def filter_by_elbow(results: list[dict]) -> list[dict]:
    if len(results) <= 1:
        return results

    max_gap = 0
    cutoff_index = len(results)

    for i in range(len(results) - 1):
        gap = results[i]["score"] - results[i + 1]["score"]
        if gap > max_gap:
            max_gap = gap
            cutoff_index = i + 1

    return results[:cutoff_index]


@app.post("/rerank")
def rerank(req: RerankRequest):
    if not _model_ready.is_set() or _model is None:
        raise HTTPException(status_code=503, detail="Model loading")
    pairs = [[req.query, doc] for doc in req.documents]
    scores = _model.predict(pairs)

    ranked = sorted(
        [
            {"index": i, "document": doc, "score": float(scores[i])}
            for i, doc in enumerate(req.documents)
        ],
        key=lambda x: x["score"],
        reverse=True,
    )

    return {"results": filter_by_elbow(ranked)}
