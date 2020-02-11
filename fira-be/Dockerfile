FROM node:12.14.0

# Switch workdir to the main app directory
WORKDIR /usr/src/app

# Copy fira-be sources and install dependencies
COPY . .
RUN npm install

# Add and execute scrpts which wait for the keycloak server to start, then start the fira backend
ADD "./docker-resources/start.sh" "./"
ADD "./docker-resources/wait-for-it.sh" "./"
RUN chmod +x ./start.sh
RUN chmod +x ./wait-for-it.sh
EXPOSE 80
ENTRYPOINT ["./start.sh"]
CMD [""]
