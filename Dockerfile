FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:18-alpine AS runner

COPY --from=builder /app/dist ./
