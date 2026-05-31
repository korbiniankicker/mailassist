FROM ollama/ollama:latest

WORKDIR /app
COPY . .

RUN chmod +x ./ollama-start.sh

ENTRYPOINT ["./ollama-start.sh"]

