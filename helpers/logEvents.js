const fs = require('fs').promises;
const path = require('path');
const { format } = require('date-fns');

const logEvents = async (message, name) => {
    const fileName = path.join(__dirname, '../Logs', `${name}`);
    const dateTime = `${format(new Date(), 'dd-MM-yyyy\tHH::mm::ss')}`;
    const contentLog = `${dateTime}-----${message}\n`;
    try {
        // Store the file where and what content to store
        // Cách 1
        fs.appendFile(fileName, contentLog);

        // Cách 2
        // const log = fs.createWriteStream(fileName, { flags: 'a' });
        // log.write(contentLog);
        // log.end();
    }
    catch (error) {
        console.log(error);
    }
}

module.exports = logEvents;