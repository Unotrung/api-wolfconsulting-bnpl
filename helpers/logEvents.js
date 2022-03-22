// const fs = require('fs').promises;
// const path = require('path');
// const { format } = require('date-fns');
// const winston = require('winston');

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

// const logger = winston.createLogger({
//     // format của log được kết hợp thông qua format.combine
//     format: winston.format.combine(
//         winston.format.splat(),
//         // Định dạng time cho log
//         winston.format.timestamp({
//             format: 'DD-MM-YYYY HH:mm:ss'
//         }),
//         // thêm màu sắc
//         winston.format.colorize(),
//         // thiết lập định dạng của log
//         winston.format.printf(
//             log => {
//                 // nếu log là error hiển thị stack trace còn không hiển thị message của log
//                 if (log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`;
//                 return `[${log.timestamp}] [${log.level}] ${log.message}`;
//             },
//         ),
//     ),
//     transports: [
//         // hiển thị log thông qua console
//         new winston.transports.Console(),
//         // Thiết lập ghi các errors vào file
//         new winston.transports.File({
//             level: 'error',
//             filename: path.join(__dirname, 'errors.log')
//         })
//     ],
// });

// module.exports = { logEvents, logger };