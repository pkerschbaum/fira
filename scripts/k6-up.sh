#!/bin/sh
docker-compose -f docker-compose.k6.yml up -d --build influxdb grafana