FROM node:20-bullseye-slim as base

RUN mkdir /opt/app
WORKDIR /opt/app

COPY . .


# allows us to watch the files for changes
FROM base as dev

# allows us to watch the files for changes
RUN apt-get update && apt-get install -y procps curl

RUN npm ci

RUN npm run build