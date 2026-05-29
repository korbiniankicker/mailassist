#!/bin/sh

ollama serve &

sleep 5

ollama pull mistral:7b
ollama pull nomic-embed-text

wait