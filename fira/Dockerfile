# Phase 1: copy commons and install its dependencies
FROM node:14.11.0 AS build-env-commons

# Switch workdir to the build directory for commons
WORKDIR /app/fira-commons

# Copy sources
COPY fira-commons/. ./

# Install app dependencies
RUN npm install

# Phase 2: copy and build fira-web
FROM node:14.11.0 AS build-env-web
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
RUN env PUBLIC_URL=$FIRA_HOMEPAGE \
  npm run build

# Phase 3: copy and build appsvc
FROM node:14.11.0 as build-env-appsvc

# Copy build of commons to appsvc
COPY --from=build-env-commons /app/fira-commons /app/fira-commons

# Switch workdir to the main app directory
WORKDIR /app/fira-appsvc

# Install app dependencies
COPY fira-appsvc/package*.json ./
RUN npm install

# Copy sources
COPY fira-appsvc/. ./
COPY tsconfig.json ../

# Create build
RUN npm run build

# Copy final build of web to appsvc
COPY --from=build-env-web /app/fira-web/build ./dist/fira-appsvc/client/build

# Phase 4: copy final build of appsvc, i.e. the entire application, to a new image
# This will get rid of any build artifacts (e.g. npm cache)
FROM node:14.11.0
WORKDIR /app/fira-appsvc

# Copy not only the final build, but also the commons directory (knex.js is installed in there. One 
# connects to any appsvc instance in the cloud and uses knexjs to manually upgrade the database)
COPY --from=build-env-appsvc /app/fira-appsvc/dist ./dist
COPY --from=build-env-appsvc /app/fira-appsvc/node_modules ./node_modules
COPY --from=build-env-appsvc /app/fira-appsvc/knex-migrations ./knex-migrations
COPY --from=build-env-appsvc /app/fira-commons ../fira-commons

# Add and execute scrpts which wait for the keycloak server to start, then start the fira backend
COPY "./docker-resources/start.sh" "./"
COPY "./docker-resources/wait-for-it.sh" "./"
RUN chmod +x ./start.sh
RUN chmod +x ./wait-for-it.sh
EXPOSE 80
ENTRYPOINT ["./start.sh"]
CMD [""]
