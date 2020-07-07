# licit-playground

Demonstrating use of MO-Movia/licit in an Angular application.

# Docker deployment

This repository contains a docker application to serve as a simple back-end for devleopment of editor applications.  It will open port 8888 for serving the editor page along with a simple CM server for hosting documents.

## Prerequisites

Before building the docker stack, the licit editor must be built and added to the project folder.

```bash
git clone https://github.com/MO-Movia/licit.git -b master
cd licit
npm install
npm pack
# note full name and location of licit-0.0.1.tgz for use below
```

## Build and start the stack

```bash
git clone https://github.com/melgish/licit-playground.git -b master
cd licit-playground
# change source to match path noted in Prerequisites step
cp ../licit/licit-0.0.1.tgz .
# use --no-cache here to force update of tiny-cm if changed
docker-compose build --no-cache
docker-compose up -d
# browse to http://localhost:8888
```

## Develper proxy
A development proxy is configured in poxy.conf.js to refer calls to port 8888.  This allows local angular development / testing of licit-playground using a previosuly created docker CM server

```bash
docker-compose up -d 
npm start
# browse to http://127.0.0.1:4200
```
