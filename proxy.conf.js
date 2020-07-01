const PROXY_CONFIG = [
  {
    context: [ '/movia/', '/auth/' ],
    target: 'http://localhost:8888',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
  }
];

module.exports = PROXY_CONFIG;
