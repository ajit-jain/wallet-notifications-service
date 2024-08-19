FROM node:20-slim as base

RUN mkdir /opt/app
WORKDIR /opt/app

COPY . .


# allows us to watch the files for changes
FROM base as dev

RUN npm ci

RUN npm run build