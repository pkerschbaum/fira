# PHASE 1: copy commons and install its dependencies
FROM node:12.14.0 AS build-env-commons

# Switch workdir to the build directory for commons
WORKDIR /app/commons

# Copy sources
COPY commons/. ./

# Install app dependencies
RUN npm install

# PHASE 2: copy and build fira-web
FROM node:12.14.0 AS build-env-web
ARG FIRA_HOMEPAGE

# Copy build of commons to fira-web
COPY --from=build-env-commons /app/commons /app/commons

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
RUN env PUBLIC_URL=$FIRA_HOMEPAGE npm run build

# PHASE 3: copy and build fira-be
FROM node:12.14.0

# Copy build of commons to fira-be
COPY --from=build-env-commons /app/commons /app/commons

# Switch workdir to the main app directory
WORKDIR /app/fira-be

# Install app dependencies
COPY fira-be/package*.json ./
RUN npm install

# Copy sources
COPY fira-be/. ./
COPY tsconfig.json ../

# Create build
RUN npm run build

# Copy final build of fira-web to fira-be
COPY --from=build-env-web /app/fira-web/build ./dist/fira-be/client/build

# Add and execute scrpts which wait for the keycloak server to start, then start the fira backend
ADD "./docker-resources/start.sh" "./"
ADD "./docker-resources/wait-for-it.sh" "./"
RUN chmod +x ./start.sh
RUN chmod +x ./wait-for-it.sh
EXPOSE 80
ENTRYPOINT ["./start.sh"]
CMD [""]
