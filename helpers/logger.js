const { createLogger, format, transports } = require('winston');
const { combine, errors, timestamp, printf } = format;
const winstonMongodb = require('winston-mongodb');
const path = require('path');

function buildProdLogger(level, name) {

    const logFormat = printf(({ level, message, timestamp, stack }) => {
        return `Time: ${timestamp} --- Status: ${level} --- ${stack || message}`;
    });

    return createLogger({
        format: combine(
            timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
            errors({ stack: true }),
            logFormat
        ),
        defaultMeta: { service: 'user-service' },
        transports: [
            // hiển thị log thông qua console
            new transports.Console(),
            // Thiết lập ghi các errors vào file
            new transports.File({
                level: `${level}`,
                filename: path.join(__dirname, '../Logs', `${name}`)
            }),
            new transports.MongoDB({
                level: `${level}`,
                db: process.env.MONGODB_URL,
                options: {
                    useUnifiedTopology: true
                },
                collection: 'log'
            })
        ],
    });
}

module.exports = { buildProdLogger };