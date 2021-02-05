# licit-playground

Demonstrating use of MO-Movia/licit in an Angular application.

# Docker required

The latest licit editor requires support from back-end services.  By supplying
your own Runtime to the component, you can customize these for scale or to
meet environment restrictions.  This project relies on 2 docker containers to
be running with exposed ports.

## Start the back-end stack

While you can download and build licit-style-service and tiny-cm yourself,
docker containers have been created and hosted on docker hub.

```bash
# clone project from github
git clone https://github.com/melgish/licit-playground.git -b main
cd licit-playground

# start the back-end stack
docker-compose up -d

# build and launch the front end using angular dev service
npm ci
npm start --open
```

## Service Links
Links between front-end and back-end are maintained by matching up the port
numbers in docker-compose.yml with those in proxy.conf.js, and the paths in
proxy.conf.js with those URI's used in by the runtime service
