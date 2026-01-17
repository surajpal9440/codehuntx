const express = require('express');
const aiRouter =  express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const solveDoubtAi = require('../controllers/solveDoubtAi');

aiRouter.post('/chat', userMiddleware, solveDoubtAi);

module.exports = aiRouter;