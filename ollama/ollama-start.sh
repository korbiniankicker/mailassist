#!/bin/sh

ollama serve &

until ollama list >/dev/null; do
  sleep 1
done

ollama pull mistral:7b
ollama pull nomic-embed-text

wait