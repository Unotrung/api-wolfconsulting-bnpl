const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const createError = require('http-errors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { buildProdLogger } = require('./helpers/logger');
const { v4: uuid } = require('uuid');

const userRoute = require('./routers/UserRouter');
const personalRoute = require('./routers/PersonalRouter');
const commonRoute = require('./routers/CommonRouter');

dotenv.config();

const app = express();

app.use(helmet());

app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(morgan('combined'));

mongoose.connect(process.env.MONGODB_URL, function (err) {
    if (!err) {
        console.log('Connect MongoDB Successfully');
    }
    else {
        console.log('Connect MongoDB Failure');
    }
}
)

const limiter = rateLimit({
    windowMs: 1000,
    max: 100,
})

app.use(limiter);

app.use('/v1/bnpl/user', userRoute);
app.use('/v1/bnpl/personal', personalRoute);
app.use('/v1/bnpl/common', commonRoute);

// Handle Error Not Found
app.use((req, res, next) => {
    // All Not Found errors will be handled centrally here
    next(createError.NotFound('This route dose not exists !'));
})

app.use((err, req, res, next) => {
    // Any middleware that fails will run down to this middleware for processing
    // Log errors in logs.log . file
    // logEvents(`Id_Log: ${uuid()} --- Router: ${req.url} --- Method: ${req.method} --- Message: ${err.message}`, 'errors.log');
    buildProdLogger('error', 'error.log').error(`Id_Log: ${uuid()} --- Router: ${req.url} --- Method: ${req.method} --- Message: ${err.message}`);
    return res.json({
        status: err.status || 500,
        message: err.message
    })
})

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is listening at PORT ${PORT}`);
})

