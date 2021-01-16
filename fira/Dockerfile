# Dockerfile based on:
# - https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/ and 
# - https://dev.to/nodepractices/docker-best-practices-with-node-js-4ln4

# Phase 1: copy commons and install its dependencies
FROM node:14.11.0@sha256:48f84f6a5f7cf5e2f8b187d32211bd95108f0e21ededd81cc28b1c9ef18039e4 AS build-env-commons

# Switch workdir to the build directory for commons
WORKDIR /app/fira-commons

# Copy sources
COPY fira-commons/. ./

# Install app dependencies
RUN npm install

# Phase 2: copy and build fira-web
FROM node:14.11.0@sha256:48f84f6a5f7cf5e2f8b187d32211bd95108f0e21ededd81cc28b1c9ef18039e4 AS build-env-web
ARG FIRA_HOMEPAGE=$FIRA_HOMEPAGE

# Copy build of commons to fira-web
COPY --from=build-env-commons /app/fira-commons /app/fira-commons

# Switch workdir to the build directory
WORKDIR /app/fira-web

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY fira-web/package*.json ./
RUN npm install

# Copy sources
COPY fira-web/. ./
COPY tsconfig.json ../

# Create production build
ENV NODE_ENV production
RUN env PUBLIC_URL=$FIRA_HOMEPAGE \
  npm run build

# Phase 3: copy and build appsvc
FROM node:14.11.0@sha256:48f84f6a5f7cf5e2f8b187d32211bd95108f0e21ededd81cc28b1c9ef18039e4 as build-env-appsvc

# Copy build of commons to appsvc
COPY --from=build-env-commons /app/fira-commons /app/fira-commons

# Switch workdir to the main app directory
WORKDIR /app/fira-appsvc

# Install app dependencies
COPY fira-appsvc/package*.json ./
RUN npm install

# Copy sources
COPY fira-appsvc/*.* ./
COPY fira-appsvc/src ./src
COPY tsconfig.json ../

# Create build
ENV NODE_ENV production
RUN npm run build

# Copy knex migrations
COPY fira-appsvc/knex-migrations ./knex-migrations

# Copy final build of web to appsvc
COPY --from=build-env-web /app/fira-web/build ./dist/fira-appsvc/client/build

# Phase 4: copy final build of appsvc, i.e. the entire application, to a new image
# This will get rid of any build artifacts (e.g. npm cache)
FROM node:14.11.0@sha256:48f84f6a5f7cf5e2f8b187d32211bd95108f0e21ededd81cc28b1c9ef18039e4

WORKDIR /app/fira-appsvc

# Copy not only the final build, but also the commons directory (knex.js is installed in there. One 
# connects to any appsvc instance in the cloud and uses knexjs to manually upgrade the database)
COPY --chown=node:node --from=build-env-appsvc /app/fira-appsvc/dist ./dist
COPY --chown=node:node --from=build-env-appsvc /app/fira-appsvc/node_modules ./node_modules
COPY --chown=node:node --from=build-env-appsvc /app/fira-appsvc/knex-migrations ./knex-migrations
COPY --chown=node:node --from=build-env-appsvc /app/fira-commons ../fira-commons

# Add and execute scrpts which wait for the keycloak server to start, then start the fira backend
COPY --chown=node:node "./docker-resources/start.sh" "./"
COPY --chown=node:node "./docker-resources/wait-for-it.sh" "./"
RUN chmod +x ./start.sh
RUN chmod +x ./wait-for-it.sh
EXPOSE 80
USER node
ENTRYPOINT ["./start.sh"]
CMD [""]
