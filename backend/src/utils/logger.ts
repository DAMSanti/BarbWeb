import winston from 'winston'
import path from 'path'
import fs from 'fs'

// Crear carpeta logs si no existe
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info

    const ts = String(timestamp)?.slice(0, 19).replace('T', ' ')
    return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`
  }),
)

const transports = [
  // Console - todo en desarrollo
  new winston.transports.Console(),

  // Error file
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: winston.format.uncolorize(),
  }),

  // Combined log
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: winston.format.uncolorize(),
  }),

  // HTTP log
  new winston.transports.File({
    filename: path.join(logsDir, 'http.log'),
    level: 'http',
    format: winston.format.uncolorize(),
  }),
]

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
    }),
  ],
})

// Helper functions
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta)
}

export const logError = (message: string, error?: Error | any) => {
  logger.error(message, {
    error: error?.message,
    stack: error?.stack,
  })
}

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta)
}

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta)
}

export const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta)
}
