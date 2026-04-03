from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI()
model = SentenceTransformer("intfloat/multilingual-e5-large")

class EmbeddingRequest(BaseModel):
    text: str
    query: bool

@app.post("/embed")
def rerank(req: EmbeddingRequest):
    prefix = "query: " if req.query else "passage: "
    embedding = model.encode(prefix + req.text, normalize_embeddings=True)
    return {"embedding": embedding.tolist()}
