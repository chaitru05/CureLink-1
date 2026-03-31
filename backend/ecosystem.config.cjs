module.exports = {
  apps: [{
    name: "curelink-backend",
    script: "server.js",
    env: {
      NODE_ENV: "production",
      PORT: 5000
    }
  }]
};
