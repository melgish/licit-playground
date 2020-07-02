FROM node:lts-alpine as tiny-cm
RUN apk --update add --no-cache bash git openssh make \
 && rm -rf /var/cache/apk

USER node
WORKDIR /home/node/

# -- build the tiny-cm server first, since that shouldn't change once built
RUN git clone https://github.com/melgish/tiny-cm.git -b master \
 && cd tiny-cm \
 && npm install \
 && npm run build
# now can use node tiny-cm to start server

# -- build playground from local source in docker
COPY --chown=node:node . ./playground
RUN cd playground \
  && npm install ./licit-0.0.1.tgz \
  && npm install \
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
