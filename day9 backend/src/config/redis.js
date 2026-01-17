const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-12464.crce182.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 12464
    }
});
module.exports=redisClient;