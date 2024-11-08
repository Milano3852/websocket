require('dotenv').config();

module.exports = {
  maxThreads: parseInt(process.env.MAX_THREADS) || 5,
  speedLimit: parseInt(process.env.SPEED_LIMIT) || 500,  // скорость в КБ/сек
  port: parseInt(process.env.PORT) || 10000
};
