# Remember to check for updates to base images to incorporate security patches
# Use a specific version of golang based on SHA256 digest for reproducibility and security
FROM golang:1.23 AS builder-go

# Use a specific version of node base on SHA256 digest for reproducibility and security
FROM node:lts-alpine AS builder

RUN apk add --no-cache jq
WORKDIR /app

ARG GOLANG_VERSION=1.23
COPY --from=builder-go /usr/local/go /usr/local/go
ENV PATH=$PATH:/usr/local/go/bin

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN jq 'to_entries | map_values({ (.key) : ("$" + .key) }) | reduce .[] as $item ({}; . + $item)' apps/angular/authui/authui/src/config.json > apps/angular/authui/authui/src/config.tmp.json && mv apps/angular/authui/authui/src/config.tmp.json apps/angular/authui/authui/src/config.json
RUN npx nx build authui

# Use a specific version of distroless based on SHA256 digest for reproducibility and security
FROM nginx:1.27 AS run

ENV JSFOLDER=/usr/share/nginx/html/*.js
COPY apps/angular/authui/authui/start-nginx.sh /usr/bin/start-nginx.sh
RUN chmod +x /usr/bin/start-nginx.sh
COPY apps/angular/authui/authui/default.conf /etc/nginx/conf.d
COPY --from=builder /app/dist/apps/angular/authui/authui/ /usr/share/nginx/html/

ENTRYPOINT [ "start-nginx.sh" ]