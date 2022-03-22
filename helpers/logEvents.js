const fs = require('fs').promises;
const path = require('path');
const { format } = require('date-fns');
const winston = require('winston');

// const logEvents = async (message, name) => {
//     const fileName = path.join(__dirname, '../Logs', `${name}`);
//     const dateTime = `${format(new Date(), 'dd-MM-yyyy\tHH::mm::ss')}`;
//     const contentLog = `${dateTime}-----${message}\n`;
//     try {
//         // Store the file where and what content to store
//         // Cách 1
//         // fs.appendFile(fileName, contentLog);

//         // Cách 2
//         // const log = fs.createWriteStream(fileName);
//         // log.write(contentLog);
//         // log.end();
//     }
//     catch (error) {
//         next(err);
//     }
// }

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.label({ label: 'Demo anonystick:' }),
        winston.format.timestamp(),
        winston.format.prettyPrint(),
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

module.exports = { logger };