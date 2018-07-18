#!/bin/bash

docker run \
    --name brewdocs-mariadb \
    -p 3307:3306 \
    -v $PWD/lib/db/mysql:/var/lib/mysql \
    -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
    -d mariadb:latest