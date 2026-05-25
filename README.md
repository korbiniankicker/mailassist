# Mailassist

Realtime RAG chat application for searching email inboxes running 100% locally. This project was mainly made for learning purposes, so using it in a professional capacity is not recommended.

## Features
- AI chat interface to ask the Agent about any information in the inbox, streaming the response in realtime using WebSockets.

- Running the models and storing all email data locally increases privacy.

- Vector similarity search, response deduplication and relevance reranking/cutoff create a high degree of accuracy with semantic queries.

- Easy local or cloud deployment with Docker compose.

## Tech stack

### Frontend
- React
- Bootstrap

### Backend
- NestJS
- FastAPI
- nginx
- Docker

### AI
- Ollama (mistral:7b, nomic-embed-text)
- HuggingFace (cross-encoder/ms-marco-MiniLM-L-6-v2, intfloat/multilingual-e5-large)

## Quick start

### Requirements
- Docker installed
- Enough RAM to handle Mistral:7b (at least 6GB VRAM recommended)

### Running the application

#### 1. Configure .env files

For the root .env file, you can just run:

``` $ cp .env.example .env ```

You then need to configure the .env file in backend/rag-microservice, where you need to fill in your imap information. Note that this is a temporary solution until proper OAuth authentication is implemented. Run

``` $ cp backend/rag-microservice/.env.example backend/rag-microservice/.env ```

and then replace the imap host, port, user and password with your information. You can create a dummy email Account [here](https://ethereal.email).

#### 2. Run Docker

``` $ docker compose up -d --build ```

## How it works
The single endpoint for the application is at localhost:8080 (or the relevant ip if hosted on another machine in the same network), where nginx serves the built react files and passes requests to the rag-microservice container, which serves two WebSocket endpoints for queries and ingesting new emails, streaming the LLM response/ingestion progress. 

#### Ingestion pipeline
When an "ingest" message is sent, the email-fetcher module fetches new emails from the inbox, formats them and returns them to the email-embedder module, where they are queued and then chunked, embedded (using either ollama or the microservice depending on specification), and passed to the email-repo module to be stored in the database. For each ingested chunk the current progess is yielded and streamed back to the client.

#### RAG pipeline
When a "query" message with the prompt in the body is sent by the client, the ai-llm module builds the query to the LLM server using the chat history, prompt, system prompt and relevant chunks provided by the context module. To only fetch semantically relevant chunks, the service runs a vector similarity search with the prompt embedding using cosine distance. However, this returns all chunks that have either a certain minimum similarity or are within the top k most similar (currently 40, both values can be set in common/constants.ts), so the result is highly inaccurate and would result in a lot of irrelevant chunks polluting the LLM's context window. Therefore, the chunks are reranked with a model from HuggingFace (I decided to use a python microservice for this and the embedding model as the python ecosystem is much more mature in this area). However, the number of relevant chunks may vary from prompt to prompt, so setting a fixed top n could put irrelevant chunks into the context or disregard potentially relevant information. Instead, I calculated the elbow point where the drop in score by the reranking model is highest and used it as a cutoff point. This ensures that only highly relevant chunks are put into the LLM's context; the tradeoff is that important chunks could still get discarded though. The LLM response is then streamed over the WebSocket connection to the client.

## To Do's
- [ ] Finish frontend (ingestion button/auto ingesting new mails; improve UX & UI)
- [ ] Add multiple user support
- [ ] Add OAuth-based email authentication
- [ ] Add option for individual model choice
- [ ] Add support for external model use with API key