FROM node:24.12.0 AS builder

WORKDIR /app

COPY /frontend/package*.json .

RUN npm install

COPY /frontend/ .

ARG VITE_BACKEND_URL_WS
ENV VITE_BACKEND_URL_WS=$VITE_BACKEND_URL_WS

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY /nginx/nginx.conf /etc/nginx/nginx.conf