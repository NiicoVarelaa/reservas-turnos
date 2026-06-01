const levels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
}

const colors = {
  ERROR: '\x1b[31m',
  WARN: '\x1b[33m',
  INFO: '\x1b[36m',
  DEBUG: '\x1b[90m',
  RESET: '\x1b[0m'
}

class Logger {
  constructor(level = levels.INFO) {
    this.level = level
  }

  _log(level, message, data = null) {
    if (this._shouldLog(level)) {
      const timestamp = new Date().toISOString()
      const color = colors[level] || colors.RESET
      const tag = `${color}[${level}]${colors.RESET}`

      if (data) {
        console.log(`${tag} ${timestamp} - ${message}`, JSON.stringify(data, null, 2))
      } else {
        console.log(`${tag} ${timestamp} - ${message}`)
      }
    }
  }

  _shouldLog(level) {
    const levelOrder = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 }
    return levelOrder[level] >= levelOrder[this.level]
  }

  error(message, data) {
    this._log(levels.ERROR, message, data)
  }

  warn(message, data) {
    this._log(levels.WARN, message, data)
  }

  info(message, data) {
    this._log(levels.INFO, message, data)
  }

  debug(message, data) {
    this._log(levels.DEBUG, message, data)
  }

  http(req, res, next) {
    const start = Date.now()
    res.on('finish', () => {
      const duration = Date.now() - start
      this.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`)
    })
    next()
  }
}

module.exports = new Logger(process.env.NODE_ENV === 'production' ? levels.INFO : levels.DEBUG)
