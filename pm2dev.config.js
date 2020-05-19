module.exports = {
  apps : [{
    name: 'API',
    script: 'src/start.js',
    instances: 1,
    watch: ["src"],
  }],
};
