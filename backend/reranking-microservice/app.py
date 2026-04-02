from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import CrossEncoder

app = FastAPI()
model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2", device="cpu")

class RerankRequest(BaseModel):
    query: str
    documents: list[str]
    top_n: int = 5

@app.post("/rerank")
def rerank(req: RerankRequest):
    pairs = [[req.query, doc] for doc in req.documents]
    scores = model.predict(pairs)
    
    ranked = sorted(
        [{"index": i, "document": doc, "score": float(scores[i])} 
         for i, doc in enumerate(req.documents)],
        key=lambda x: x["score"],
        reverse=True
    )
    return {"results": ranked[:req.top_n]}
