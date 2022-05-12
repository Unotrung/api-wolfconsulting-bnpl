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
const fecRoute = require('./routers/FecRouter');
const otpConfigRoute = require('./routers/otpConfigRouter');

const http = require("http");
const authGraphql = require("./middlewares/auth-graphql");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./graphql");
const ws = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const { execute, subscribe } = require("graphql");

dotenv.config();

const app = express();

app.use(morgan('combined'));

app.use(helmet());

app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

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
app.use('/v1/bnpl/fec', fecRoute);
app.use('/v1/bnpl/otp_config', otpConfigRoute);

app.use((err, req, res, next) => {
    buildProdLogger('error', 'error.log').error(`Id_Log: ${uuid()} --- Hostname: ${req.hostname} --- Ip: ${req.ip} --- Router: ${req.url} --- Method: ${req.method} --- Message: ${err.message}`);
    return res.json({
        status: err.status || 500,
        message: err.message
    })
})


app.use('/graphql',
    authGraphql,
    graphqlHTTP(req => ({
        schema: schema,
        graphiql: true,
        context: {
            isAuthenticated: req.isAuthenticated,
            user: req.user,
            error: req.error,
            masterKey: req.masterKey
        },
        customFormatErrorFn: (err) => {
            if (!err.originalError) {
                return err
            }
            /*
                You can add the following to any resolver
                const error = new Error('My message')
                error.data = [...]
                error.code = 001
            */
            const message = err.message || 'An error occured.'
            const code = err.originalError.code
            const data = err.originalError.data
            return {
                // ...err,
                message,
                code,
                data
            }
        }

    })))

// app.listen(4000)
// app.use((req, res, next) => {
//     next(createError.NotFound('This route dose not exists !'));
// })

app.use((req, res, next) => {
    next(createError.NotFound('This route dose not exists !'));
})

const server = http.createServer(app)
const PORT = process.env.PORT;
server.listen(process.env.PORT, () => {
    const path = '/subscriptions'
    const wsServer = new ws.Server({
        server,
        path
    });

    useServer(
        {
            schema,
            execute,
            subscribe,
            onConnect: (ctx) => {
                console.log('Connect');
            },
            onSubscribe: (ctx, msg) => {
                console.log('Subscribe');
            },
            onNext: (ctx, msg, args, result) => {
                console.debug('Next');
            },
            onError: (ctx, msg, errors) => {
                console.error('Error');
            },
            onComplete: (ctx, msg) => {
                console.log('Complete');
            },
        },
        wsServer
    );
    console.log(`Server is listening at PORT ${PORT}`)
    console.log(`GraphQL endpoint: /graphql`)
    console.log(`GraphQL subscription: /subscriptions`)
})

// const PORT = process.env.PORT;
// app.listen(PORT, () => {
//     console.log(`Server is listening at PORT ${PORT}`);
// })
