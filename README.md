# licit-playground

Demonstrating use of MO-Movia/licit in an Angular application.

# Docker deployment

This repository contains a docker application to serve as a simple back-end for devleopment of editor applications.  It will open port 8888 for serving the editor page along with a simple CM server for hosting documents.

## Build and start the stack

licit-playground now defaults to using published version of licit!

```bash
git clone https://github.com/melgish/licit-playground.git -b master
cd licit-playground
# Use --no-cache here to force update of tiny-cm if it has been changed
docker-compose build --no-cache
docker-compose up -d
# Browse to http://localhost:8888
```

## Develper proxy
A development proxy is configured in poxy.conf.js to refer calls to port 8888.  
This allows local angular development / testing of licit-playground using a 
previosuly created docker CM server and a locally linked version of licit.

```bash
docker-compose up -d 
npm start
# Browse to http://127.0.0.1:4200
```
