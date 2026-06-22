# Mailassist

A local-first RAG chat application for querying email inboxes using natural language. Built as a learning project to explore AI pipelines, vector search, and full-stack architecture.

![Demo Screenshot](/images/demo_screenshot.png)

## What it does

Mailassist lets you chat with your email inbox. Ask it questions like _“Did anyone follow up about the project last week?”_ and it finds semantically relevant emails, reranks them for accuracy, and streams a response back in real time with everything running locally on your machine.

## Quick start

### Requirements

- Docker
- At least 6 GB VRAM for the Ollama models (mistral:7b, nomic-embed-text) unless Ollama is running externally

### 1. Configure environment files

```bash
cp .env.example .env
cp backend/rag-microservice/.env.example backend/rag-microservice/.env.production
```

Edit `backend/rag-microservice/.env` and fill in your IMAP credentials (`host`, `port`, `user`, `password`).

Note: IMAP credentials are a temporary solution — OAuth support is on the roadmap. You can use a dummy inbox at [ethereal.email](https://ethereal.email) for testing.

### 2. Start the application

Choose the setup that matches your environment:

```bash
# Local CPU (default)
docker compose up -d --build

# Local NVIDIA GPU
docker compose -f docker-compose.yaml -f docker-compose.nvidia.yaml up -d --build

# Local AMD GPU
docker compose -f docker-compose.yaml -f docker-compose.amd.yaml up -d --build

# External Ollama (running elsewhere on the network)
docker compose -f docker-compose.yaml -f docker-compose.external-ollama.yaml up -d --build
```

The app is available at `http://localhost:8080`.  
If running on another machine in the same network, replace `localhost` with that machine's IP, but rememer to set the VITE_BACKEND_URL env variable to you machine's IP before building.

On first startup with a local Ollama, it will automatically download:

- mistral:7b
- nomic-embed-text

so it may take a while. If using an external Ollama, make sure these models are pulled on that machine.

### GPU acceleration

While running purely on CPU is possible, it will significantly slow down your model and make using the assistant impractical. GPU acceleration is supported for both NVIDIA and AMD GPUs via Docker Compose override files.

Prerequisites:

- **NVIDIA**: Install the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) and configure Docker with the `nvidia` runtime.
- **AMD**: Ensure the ROCm kernel driver is installed and `amdgpu` is loaded on the host.

Start the stack with your GPU vendor:

```bash
# NVIDIA
docker compose -f docker-compose.yaml -f docker-compose.nvidia.yaml up -d --build

# AMD
docker compose -f docker-compose.yaml -f docker-compose.amd.yaml up -d --build
```

**NVIDIA**: The override passes through all available GPUs to Ollama and both Python microservices (reranking and embeddings), setting `DEVICE=cuda` on the Python services. The official `ollama/ollama` image includes CUDA support out of the box.

**AMD**: The override uses the `ollama/ollama:rocm` base image and mounts the necessary AMD devices (`/dev/kfd`, `/dev/dri`) into the Ollama container. The Python microservices remain on CPU — ROCm support for PyTorch-based services is experimental and not included in this setup.

> If you already run Ollama on another machine on your network, use the `docker-compose.external-ollama.yaml` override instead. It removes the local Ollama container entirely — just point `OLLAMA_URL` at the external address in your `.env` file and make sure `mistral:7b` is pulled on that machine.

## Architecture

```
Browser (React) ◀── static files ──┐
    │                               │
    ▼                               │
nginx :8080 ────────────────────────┘
    │
    └──▶ NestJS (RAG orchestration, WebSocket API)
              │
              ├──▶ Ollama (mistral:7b — LLM inference)
              ├──▶ Ollama (nomic-embed-text — embeddings)
              ├──▶ FastAPI microservice
              │         ├── Reranking  (cross-encoder/ms-marco-MiniLM-L-6-v2)
              │         └── Embeddings (intfloat/multilingual-e5-large)
              │
              └──▶ PostgreSQL + pgvector (chunk storage & similarity search)
```

## How it works

### Ingestion pipeline

When an ingest message is sent, the email-fetcher module retrieves new emails from the configured IMAP inbox, formats them and passes them to the ingestion pipeline queue where they are chunked, embedded (using either the HuggingFace model via the Python microservice or the Ollama model) and stored in PostgreSQL with pgvector. For each ingested chunk, a progress update is streamed back to the client

### Retrieval pipeline

When the client sends a query, the pipeline embeds the prompt, retrieves the top-k most similar chunks, reranks them and passes them to llm module, where the query is built using the conversation history, prompt, relevant chunks and system prompt. The LLM reponse is then streamed back to the client.

## Important technical decisions

**Vector similarity search**
Incoming queries are embedded and matched against the stored embeddings of the chunked emails using cosine similarity, returning the top-k most similar results above a certain minimum threshold.

**Cross-encoder reranking**
Initial vector search is intentionally broad and noisy. A cross-encoder model (via the Python FastAPI microservice) reranks the candidate chunks for much higher precision. I chose Python here because of its significantly more mature ML ecosystem.

**Elbow-point cutoff**
Rather than using a fixed top-n after reranking, which could include irrelevant chunks or discard relevant ones, the pipeline detects where the score drop between consecutive chunks is steepest and cuts off there. This keeps the LLM’s context window clean without requiring manual tuning per query.

**Real-time streaming over WebSockets**
Both the ingestion progress and LLM response are streamed back to the client via WebSocket connections, so feedback is immediate rather than waiting for a full response.

## Tech stack

| Layer          | Technologies                                                                       |
| -------------- | ---------------------------------------------------------------------------------- |
| Frontend       | React, Bootstrap                                                                   |
| Backend        | NestJS, FastAPI, nginx                                                             |
| AI / ML        | Ollama (mistral:7b, nomic-embed-text), HuggingFace cross-encoder & multilingual-e5 |
| Infrastructure | Docker Compose                                                                     |

## Known limitations

This is a learning project, and the current architecture has some relevant constraints:

**Semantic-only retrieval:**
The retrieval pipeline is purely vector-based, which means it works well for semantic queries like _“emails about the project deadline”_ but poorly for queries requiring metadata like _"How many emails did I get from Google"_ or combined semantic and metadata querying.

**No tool use or multi-step reasoning:**
The LLM receives a flat list of chunks deemed relevant by the retrieval pipeline, plus the prompt. There’s no agentic layer, no tool use, and no chaining of multiple calls. Therefore, queries that require reasoning across multiple steps or combining different types of information aren't yet handled well.

**Model capacity:**
Mistral:7b is a relatively small model,so even with good context, its reasoning depth and instruction-following are very limited compared to larger models. Prompt engineering improvements would help at the margins, but the ceiling of a 7B model is relatively low for complex tasks.

Seeing as how this mainly a learning project, I will probably not make any significant changes to the retrieval pipeline as I want to eventually move on.

## Roadmap

- [ ] Complete frontend
- [ ] OAuth-based email authentication
- [ ] Multi-user support
- [ ] Configurable model selection
- [ ] Support for external models via API key
- [ ] Hybrid retrieval: combine vector similarity with structured metadata queries to support non-semantic queries
- [ ] Tool use / agentic layer to enable multi-step reasoning
