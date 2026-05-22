FROM node:24.12.0 AS builder

WORKDIR /app

COPY ../frontend/package*.json .

RUN npm install

COPY ../frontend/ .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.config /etc/nginx/nginx.conf