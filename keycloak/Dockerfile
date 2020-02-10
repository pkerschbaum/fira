FROM jboss/keycloak:8.0.1

# import realm for application
COPY ["./docker-resources/realm-to-import.json", "~/"]
ENV KEYCLOAK_IMPORT="~/realm-to-import.json"

# override start sequence of keycloak image: use custom script to add an admin user for the realm, then start the server
ADD "./docker-resources/start.sh" "/"
ENTRYPOINT ["/start.sh"]
CMD [""]
