const config = require('../config');

// Logger untuk mencatat informasi, error, dan peringatan
class Logger {
  static info(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  static error(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, error ? error.stack || error : '');
  }

  static warn(message, data = null) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  static debug(message, data = null) {
    if (config.nodeEnv === 'development') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] DEBUG: ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
}

module.exports = Logger;
