# K6 docker environment for load and performance tests

The Fira repository contains a Docker-Compose configuration which sets up K6, InfluxDB and Grafana.
The configuration makes sure that the networks are properly connected together.

Taken and adapted from https://github.com/loadimpact/k6

## How to setup the K6 environment and run a script

**Hint:** Run the commands below in the root directory of the Fira repository.

1. Start InfuxDB and Grafana container.

   ```sh
   ./scripts/k6-up.sh
   ```

1. Open the Grafana dashboard. It should be available on the Docker host on
   the port specified by the environment variable `K6_GRAFANA_PUBLIC_PORT`.  
   Import dashboard with ID 2587 (<https://grafana.com/grafana/dashboards/2587>).  
   As InfluxDB data source, use `myinfluxdb`.
1. Execute your K6 script using the K6 docker container.  
   In the following example, the path to the script is `./lpt-script.js`.

   ```sh
   docker-compose -f docker-compose.k6.yml run k6 run - < ./lpt-script.js
   ```

## Hints

1. You can pass the option `--http-debug="full"` to the K6 `run` command if you want to see details of
   HTTP requests (see also <https://k6.io/docs/cloud/cloud-faq/what-is-the-best-way-to-debug-my-load-test-scripts#tip-4-use-builtin-debugging-options>).
   So, the command looks like this:

   ```sh
   docker-compose -f docker-compose.k6.yml run k6 run --http-debug="full" - < ./lpt-script.js
   ```
