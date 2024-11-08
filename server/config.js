require('dotenv').config();

module.exports = {
  maxThreads: parseInt(process.env.MAX_THREADS) || 5,
  speedLimit: parseInt(process.env.SPEED_LIMIT) || 500,
  port: parseInt(process.env.PORT) || 3000
};
