FROM node:lts-alpine
RUN apk --update add --no-cache bash git openssh make \
 && rm -rf /var/cache/apk

USER node
WORKDIR /home/node/

# Build the tiny-cm server first, since that shouldn't change once built
RUN git clone https://github.com/melgish/tiny-cm.git -b master \
 && cd tiny-cm \
 && npm ci \
 && npm run build
# Now can use `node tiny-cm` to start server CM api.

# Build playground from local source in docker
# Note here taht version has been stripped from tgz to avoid having to update
# Docker file every time a new release of licit is used.  Instead rename the
# file during copy to match what is below.  Hint remove -${VERSION} section.
COPY --chown=node:node . ./playground
RUN cd playground \
  && npm ci \
  && npm run build

ENV \
  CM_ENDPOINT=movia/content \
  CM_NAMESPACE=http://fiorellonj.com/tiny-cm \
  CM_PORT=8888 \
  CM_DATAPATH=/home/node/data/ \
  NG_APP=/home/node/playground/dist/playground


# Volume and port need to match environment settings above
# or supplied via docker-compose.
RUN mkdir -p /home/node/data
VOLUME ["/home/node/data"]
EXPOSE 8888

CMD node tiny-cm
