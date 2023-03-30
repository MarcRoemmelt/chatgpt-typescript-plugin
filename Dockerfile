#
# ---- Base Node ----
FROM node:19.8.1-alpine3.17 AS base
# set working directory
WORKDIR /app
# Update npm
RUN npm --silent install -g --depth 0 npm@latest
# Install pnpm
RUN npm --silent install -g --depth 0 pnpm@latest
RUN pnpm set progress=false && npm config set depth 0
# Install nx dependencies
RUN pnpm --silent install reflect-metadata tslib rxjs bcrypt

#
# ---- Dependencies ----
FROM base AS dependencies
# copy dependecies files
COPY package.json .
COPY pnpm-lock.yaml .
# install node packages
RUN pnpm install --silent --frozen-lockfile

#
# ---- Builder ----
FROM base AS builder
# copy node_modules for build
COPY --from=dependencies /app/node_modules node_modules
# copy app sources
COPY . .
# build production app
RUN pnpm run build

#
# ---- Prod Dependencies ----
FROM base AS proddependencies
# install node-prune (https://github.com/tj/node-prune)
RUN wget -O - https://gobinaries.com/tj/node-prune | sh

# copy all node_modules
COPY --from=dependencies /app/node_modules node_modules
# copy project package.json
COPY --from=builder /app/package.json .

RUN pnpm prune --silent --prod
# run node prune
RUN /usr/local/bin/node-prune

#
# ---- Release ----
FROM alpine:3.17
# Install Nodejs (this setup results in significantly smaller image sizes)
RUN apk add --update nodejs=18.14.2-r0

# copy production node_modules
COPY --from=proddependencies /app/node_modules ./node_modules
# copy production build
COPY --from=builder /app/dist .
# expose port and define CMD
EXPOSE 3333
CMD node ./main.js
