const express = require('express');
const userMiddleWare = require('../middleware/userMiddleware');
const submitRouter = express.Router()
const {submitCode,runCode }= require('../controllers/userSubmission')

submitRouter.post("/submit/:id",userMiddleWare,submitCode);
submitRouter.post("/run/:id",userMiddleWare,runCode);

module.exports=submitRouter;