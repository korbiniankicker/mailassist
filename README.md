# Mailassist

Realtime RAG chat application for searching E-Mail inboxes running 100% locally.

## Features

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

and then replace the imap host, port, user and password with your information. You can create a dummy E-Mail Account here: [https://ethereal.email]

#### 2. Run Docker

``` $ docker compose up -d --build ```