module.exports = {
  apps: [
    {
      name: 'nostra-app',
      script: './build/server.js',
      instances: 'max',
      exec_mode: 'cluster',
    },
  ],
};
