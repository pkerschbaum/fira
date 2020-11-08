FROM jboss/keycloak:8.0.1

# import realm for application
COPY ["./docker-resources/realm-to-import.json", "~/"]
ENV KEYCLOAK_IMPORT="~/realm-to-import.json"

# override start sequence of keycloak image: use custom script to add an admin user for the realm, then start the server
COPY "./docker-resources/start.sh" "./"
COPY "./docker-resources/wait-for-it.sh" "./"
USER root
RUN chmod a+x ./start.sh
RUN chmod a+x ./wait-for-it.sh
USER 1000
ENTRYPOINT ["/start.sh"]
CMD [""]
