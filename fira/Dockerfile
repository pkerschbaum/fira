FROM node:12.14.0 AS build-env-web
ARG FIRA_HOMEPAGE

# Phase 1: copy and build fira-web
# Switch workdir to the build directory
WORKDIR /app/fira-web

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY fira-web/package*.json ./
RUN npm install

# Copy sources
COPY fira-web/. ./
COPY fira-be/. ../fira-be/

# Create production build
RUN env PUBLIC_URL=$FIRA_HOMEPAGE npm run build

# Phase 2: copy and build fira-be
FROM node:12.14.0

# Switch workdir to the main app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY fira-be/package*.json ./
RUN npm install

# Copy sources
COPY fira-be/. .

# Create build
RUN npm run build

# Copy final build of fira-web to fira-be
COPY --from=build-env-web /app/fira-web/build ./client/build

# Add and execute scrpts which wait for the keycloak server to start, then start the fira backend
ADD "./docker-resources/start.sh" "./"
ADD "./docker-resources/wait-for-it.sh" "./"
RUN chmod +x ./start.sh
RUN chmod +x ./wait-for-it.sh
EXPOSE 80
ENTRYPOINT ["./start.sh"]
CMD [""]
