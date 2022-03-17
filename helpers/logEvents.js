const fs = require('fs').promises;
const path = require('path');
const { format } = require('date-fns');

const logEvents = async (message, name) => {
    const fileName = path.join(__dirname, '../Logs', `${name}`);
    const dateTime = `${format(new Date(), 'dd-MM-yyyy\tHH::mm::ss')}`;
    const contentLog = `${dateTime}-----${message}\n`;
    try {
        // Store the file where and what content to store
        fs.appendFile(fileName, contentLog);
    }
    catch (error) {
        console.log(error);
    }
}

module.exports = logEvents;