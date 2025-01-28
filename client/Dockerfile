FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV BACKEND_WS_URL=ws://localhost:8000

EXPOSE 5173

CMD ["run.sh"]