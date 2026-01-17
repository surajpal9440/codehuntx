const express = require('express');
const app = express();
require('dotenv').config();
const main = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/userAuth');
const redisClient = require('../src/config/redis');
const problemRouter = require("./routes/problemCreator")
const submitRouter = require('./routes/codeSubmit&run');
const cors = require('cors');
const passport = require('passport');
const aiRouter = require('./routes/aiChatting');
const videoRouter = require('./routes/videoCreator');

require('./config/passportgauth');
//  Middleware
app.use(cors({
    origin: 'http://localhost:5173', //frontend ka port
    credentials: true, //cookies ko allow krne k liye
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize()); //  Initialize Passport

app.use('/user', authRouter);  //localhost me pehle isko likhenge phir routes ko
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use('/video', videoRouter);

// Connect to DB first, then start server
const InitializeConnection = async () => {
    try {
        await Promise.all([main(), redisClient.connect()]); //dono DB parallel me hi connect honge 
        console.log("Both DB Connected")

        app.listen(process.env.PORT || 3000, () => {
            console.log("Server listening at port number: " + (process.env.PORT || 3000));



        })
    }
    catch (err) {
        console.log("Error: " + err);
    }
}

InitializeConnection();


// main()
//   .then(() => {
//     app.listen(process.env.PORT, () => {
//       console.log("Server listening at port: " + process.env.PORT);
//     });
//   })
//   .catch((err) => console.log("Error occurred while connecting to DB: " + err));
