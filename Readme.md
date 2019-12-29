# FiRA - Fine-grained Relevance Annotation

## How to run

Two commands:

1. ```docker-compose up -d``` ... this will launch all essential services of the application. One can inspect the logs with ```docker-compose logs -f```.
1. ```docker-compose -f docker-compose.yml -f docker-compose.admin.yml up -d``` ... this will launch not only the essential services, but also admin tools (e.g., PgAdmin to view the contents of the Postgres Databases). You can even fire this command if the application was bootstrapped via the first command; only the admin tools will get additionally started.

The detached mode (Flag ```-d```) is used in both options because this is the recommended way of launching an application with docker-compose (not using the detached mode leads to the problem that if the terminal is closed or the process is terminated via Ctrl+C, the entire application stops...).

Keep in mind that for viewing logs (```docker-compose logs```), viewing the running containers (```docker-compose ps```) or stopping the application (```docker-compose down```), one has to use the same options as used for starting the application.
