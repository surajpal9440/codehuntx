// token ko validate krne ke liye usermiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user')
const redisClient = require('../config/redis');

const adminMiddleWare = async (req, res, next) => {
    try {
        let { token } = req.cookies;

        console.log("DEBUG HEADERS:", req.headers);
        console.log("DEBUG COOKIES:", req.cookies);

        // 🚀 Added: Check Authorization header if cookie is missing
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
            console.log("DEBUG TOKEN EXTRACTED:", token);
        }

        if (!token)
            throw new Error("Token is not present");

        const payload = jwt.verify(token, process.env.JWT_KEY);

        const { _id } = payload;

        if (!_id)
            throw new Error("Id is missing");

        const result = await User.findById(_id);

        //adding this changes in adminmiddleware.js
        if (payload.role != 'admin')
            throw new Error("Invalid Token")

        if (!result) {
            throw new Error("User Doestn't Exist");
        }

        //redis ke blockloist me present hai ki nahi
        const IsBlocked = await redisClient.exists(`token:${token}`);

        if (IsBlocked)
            throw new Error("Invalid Token");

        req.result = result;

        next();
    }
    catch (err) {
        res.status(401).send("Error: " + err.message)
    }
}
module.exports = adminMiddleWare;
