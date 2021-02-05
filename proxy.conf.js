const PROXY_CONFIG = [
  {
    context: [ '/cm-service/*' ],
    // match port# in docker-compose.yml
    target: 'http://localhost:3001',
    pathRewrite: {
      "^/cm-service": ""
    },
    logLevel: 'debug',
  },
  {
    context: [ '/style-service/' ],
    // match port# in docker-compose.yml
    target: 'http://localhost:3000',
    pathRewrite: {
      "^/style-service": ""
    },
    logLevel: 'debug',
  }
];

module.exports = PROXY_CONFIG;
