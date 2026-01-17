const express = require('express');
const adminMiddleWare = require('../middleware/adminMiddleWare');
const userMiddleware = require('../middleware/userMiddleware')
const { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblems, solvedAllProblemByUser, submittedProblem } = require('../controllers/userProblem');
const { submitBatch } = require('../utils/problemutiliy');

const problemRouter = express.Router();




//Create --> isme admin ke midddleware se jana padega
problemRouter.post('/create', adminMiddleWare, createProblem);
//update -->  isme bhi admin ke midddleware se jana padega
problemRouter.put('/update/:id', adminMiddleWare, updateProblem);
//delete --> isme bhi admin ke midddleware se jana padega
problemRouter.delete('/delete/:id', adminMiddleWare, deleteProblem);



//fetch --> inn teeno me usermiddleware lagega
problemRouter.get('/problemById/:id', userMiddleware, getProblemById);  //hume sirf kuch field ko hi dikhana hai like title,description,difficulty... hume faltu me problemcreator ki id ,hiddentestcases nhi bhejni hai kyu ki jb fetch horra tha data to vo saari fields ko lake derra hai 
//so getProblemById function me selct krenge feilds jo dikhana hai             
//fetchAll
problemRouter.get('/getAllProblem', userMiddleware, getAllProblems);
//particular user ne konsi konsi problems ko solve kri hai
problemRouter.get('/problemSolvedByuser', userMiddleware, solvedAllProblemByUser);
//ek particular problem ke user ne kitne bar submission kiya hai vo nikalana hai
problemRouter.get('/submittedProblem/:id', userMiddleware, submittedProblem);

module.exports = problemRouter;  //isko import express.js me karayenge

