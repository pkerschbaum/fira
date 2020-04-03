FROM node:12.14.0

# Switch workdir to the main app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN npm install

# Copy fira-be sources
COPY . .

# Build fira-be
RUN npm run build

# Add and execute scrpts which wait for the keycloak server to start, then start the fira backend
ADD "./docker-resources/start.sh" "./"
ADD "./docker-resources/wait-for-it.sh" "./"
RUN chmod +x ./start.sh
RUN chmod +x ./wait-for-it.sh
EXPOSE 80
ENTRYPOINT ["./start.sh"]
CMD [""]
