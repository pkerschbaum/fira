# Fira - Fine-grained Relevance Annotation

## How to run (in production mode)

1. [Put data files in a directory on the host system](##1:-Put-data-files-in-a-directory-on-the-host-system)
1. [Set environment variables](##2:-Set-environment-variables)
1. [Run the application](##3:-Run-the-application)
1. [Inspect the file containing the imported users](##4:-Inspect-the-file-containing-the-imported-users)

### #1: Put data files in a directory on the host system

On the first startup, Fira will import all the data necessary to run the application.

The files needed are:

- `users.tsv`
- `documents.tsv`
- `queries.tsv`
- `judgement-pairs.tsv`
- `config.tsv`

See [`sample/data`](sample/data) for example files and the predefined file structure.

### #2: Set environment variables

Credentials, ports, and other parameters for deployment must be set as environment variables for `docker-compose`.  
The recommended way is to create a `.env` file next to the `docker-compose.yml` file.

The following example shows the parameters which must be set (see also [`sample/.env`](sample/.env)).  
The parameter `FIRA_BE_DATA_DIRECTORY` must match the absolute path to the directory where the data files (`users.tsv` etc.) are. Also, don't forget to use more sensible values for the password parameters!

```properties
# users and credentials
ADMIN_USER=admin
ADMIN_PASSWORD=admin
ADMIN_EMAIL=admin@domain.com
FIRA_DB_USER=fira
FIRA_DB_PASSWORD=password
KEYCLOAK_DB_USER=keycloak
KEYCLOAK_DB_PASSWORD=password

# externally exposed ports (i.e., ports mapped on host system)
FIRA_BE_PUBLIC_PORT=80

# externally exposed ports (only applicable if the application is run in development mode)
KEYCLOAK_PUBLIC_PORT=8080
PGADMIN_PUBLIC_PORT=8079
FIRA_DATABASE_PUBLIC_PORT=5432

# docker volumes for backend
FIRA_BE_DATA_DIRECTORY=/c/data/fira-data/
FIRA_BE_DATABASE_DIRECTORY=/c/data/fira-db/
KEYCLOAK_DATABASE_DIRECTORY=/c/data/keycloak-db/

# configuration for domain the app is deployed on
FIRA_HOMEPAGE=https://my-domain/path-of-app
```

### #3: Run the application

Run `docker-compose up -d` on the docker host. This will launch all services of the application necessary to operate in production. One can inspect the logs with `docker-compose logs -f`.

### #4: Inspect the file containing the imported users

Fira will write the generated credentials of all imported users to the file `FIRA_BE_DATA_DIRECTORY\out\users.tsv`.

## Additional information

### Hints for using Docker-Compose

The detached mode (Flag `-d`) is used in both options because this is the recommended way of launching an application with docker-compose (not using the detached mode leads to the problem that if the terminal is closed or the process is terminated via Ctrl+C, the entire application stops...).

If you do not have `docker-compose` installed on your host system, you can try the following command (taken from [cloud.google.com/community/tutorials/docker-compose-on-container-optimized-os](https://cloud.google.com/community/tutorials/docker-compose-on-container-optimized-os)):

```bash
docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v "$PWD:$PWD" \
    -w="$PWD" \
    docker/compose:latest up -d
```

## Development

Run the application with `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d`.
This will launch not only the essential services, but also PgAdmin to inspect the contents of the Postgres Databases.
Further, all services normally not exposed from the docker network (e.g. keycloak, postgres database servers) will get exposed to the host system.
This allows to connect the local instance of the fira backend to the services running in docker.  
You can even run this command if the application was bootstrapped via the command for the production environment; only the admin tools will get additionally started.

The PgAdmin Web UI is available at <http://localhost:8079> (or whatever port set with `PGADMIN_PUBLIC_PORT`). To add the Fira database server, follow these steps:

1. Object -> Create -> Server...
1. Tab General:
   - Name: `fira`
1. Tab Connection:
   - Host name/address: `postgres_fira`
     - Hint: if you experience problems connecting to the database docker container, try that: <https://medium.com/@samichkhachkhi/localhost-postgres-docker-connection-refused-using-pgadmin-a27b91de7342>
   - Port: Value of `FIRA_DATABASE_PUBLIC_PORT`
   - Username: Value of `FIRA_DB_USER`
   - Password: Value of `FIRA_DB_PASSWORD`

Keep in mind that for viewing logs (`docker-compose logs`), viewing the running containers (`docker-compose ps`) or stopping the application (`docker-compose down`), one has to use the same docker-compose.yml files as used for starting the application.  
So the command to view logs would be e.g. `docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs`.
