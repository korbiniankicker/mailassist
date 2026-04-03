from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import CrossEncoder

app = FastAPI()
model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2", device="cpu")

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
    pairs = [[req.query, doc] for doc in req.documents]
    scores = model.predict(pairs)
    
    ranked = sorted(
        [{"index": i, "document": doc, "score": float(scores[i])} 
         for i, doc in enumerate(req.documents)],
        key=lambda x: x["score"],
        reverse=True
    )

    return {"results": filter_by_elbow(ranked)}
    