import winston from 'winston'

const winstonLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            handleExceptions: false
        }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
})

export default winstonLogger
