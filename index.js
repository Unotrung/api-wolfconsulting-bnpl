const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const userRoute = require('./routers/UserRouter');
const personalRoute = require('./routers/PersonalRouter');

dotenv.config();

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Setup Mongoose
mongoose.connect(process.env.MONGODB_URL, function (err) {
    if (!err) {
        console.log('Connect MongoDB Successfully');
    }
    else {
        console.log('Connect MongoDB Failure');
    }
}
)

// ROUTES
app.use('/v1/user', userRoute);
app.use('/v1/personal', personalRoute);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is listening at PORT ${PORT}`);
})

