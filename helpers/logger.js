const { createLogger, format, transports } = require('winston');
const { combine, errors, timestamp, colorize, printf } = format;
const path = require('path');

function buildProdLogger(level, name) {
    const logFormat = printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} ${level}: ${stack || message}`;
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
            })
        ],
    });
}

module.exports = { buildProdLogger };