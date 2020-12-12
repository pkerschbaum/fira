# FiRA - Fine-grained Relevance Annotation

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
The parameter `FIRA_APPSVC_DATA_DIRECTORY` must match the absolute path to the directory where the data files (`users.tsv` etc.) are. Also, don't forget to use more sensible values for the parameters for credentials!

```properties
# --- users and credentials ---
ADMIN_USER=admin
ADMIN_PASSWORD=admin
FIRA_PERSISTENT_DB_USER=fira
FIRA_PERSISTENT_DB_PASSWORD=password
FIRA_PERSISTENT_DB_DATABASENAME=fira
FIRA_PERSISTENT_DB_URL=postgresql://fira:password@postgres_fira:5432/fira
KEYCLOAK_DB_USER=keycloak
KEYCLOAK_DB_PASSWORD=password

# --- variables for connection (externally exposed ports, i.e. ports mapped on host system) ---
FIRA_APPSVC_PUBLIC_PORT=80

# --- docker volumes for backend ---
FIRA_APPSVC_DATA_DIRECTORY=/c/data/fira-data/
FIRA_PERSISTENT_DB_DIRECTORY=/c/data/fira-db/
KEYCLOAK_DATABASE_DIRECTORY=/c/data/keycloak-db/

# --- configuration for domain the app is deployed on. Avoid trailing slash ("/") ---
FIRA_HOMEPAGE=https://my-domain/path-of-app

# --- DEVELOPMENT VARIABLES ---
NODE_ENV=development
FIRA_APPSVC_INTERNAL_PORT=80
FIRA_DEV_PERSISTENT_DB_PUBLIC_PORT=8079
PGADMIN_PUBLIC_PORT=8078
KEYCLOAK_PUBLIC_PORT=8077
K6_GRAFANA_PUBLIC_PORT=8076
PGADMIN_EMAIL=pgadmin@existiert.net
PGADMIN_PASSWORD=pgadmin
```

### #3: Run the application

Run `docker-compose up -d --build` on the docker host. This will launch all services of the application necessary to operate in production. One can inspect the logs with `docker-compose logs -f`.

_Note:_ the option `--build` will rebuild the docker images every time the application is started. This will avoid old images being used by docker, and the Dockerfiles are structured in a way so that docker will re-use caches as much as possible, thus the rebuild will take as little time as needed.

### #4: Inspect the file containing the imported users

Fira will write the generated credentials of all imported users to the file `FIRA_APPSVC_DATA_DIRECTORY\out\users.tsv`.

## Additional information

### Hints for using Docker-Compose

The detached mode (Flag `-d`) is used in both options because this is the recommended way of launching an application with docker-compose (not using the detached mode leads to the problem that if the terminal is closed or the process is terminated via Ctrl+C, the entire application stops...).

If you do not have `docker-compose` installed on your host system, you can try the following command (taken from [cloud.google.com/community/tutorials/docker-compose-on-container-optimized-os](https://cloud.google.com/community/tutorials/docker-compose-on-container-optimized-os)):

```bash
docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v "$PWD:$PWD" \
    -w="$PWD" \
    docker/compose:latest up -d --build
```

## Development

Run the application with [`./scripts/dev-up.sh`](./scripts/dev-up.sh).
This will launch not only the essential services, but also [PgAdmin](https://hub.docker.com/r/dpage/pgadmin4/) to inspect the contents of the postgres database.
Furthermore, all services normally not exposed from the docker network (e.g. keycloak, postgres database server) will get exposed to the host system.
This allows to connect the local instance of the fira backend to the services running in docker.

The PgAdmin Web UI is available at <http://localhost:8078> (or whatever port set with `PGADMIN_PUBLIC_PORT`). The postgres database is automatically added to PgAdmin. You only have to enter the password when connecting.

The [`scripts`](./scripts/) folder contains more useful scripts to interact with the docker environment.
