const { getLanguageById, submitBatch, submitToken } = require('../utils/problemutiliy');
const Problem = require("../models/problems");
const User = require('../models/user');
const Submisssion = require('../models/submission');
const SolutionVideo = require("../models/solutionVideo")

const createProblem = async (req, res) => {
  const {
    title,
    description,
    Difficulty,
    tags,
    visibilityTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
    problemCreator
  } = req.body;

  try {
    for (const { language, completeCode } of referenceSolution) {
      //language and completecode nikalne ke baad isse judge0 ko denge

      //ye format me judge0 ko denge
      //source_code: means completecode
      //language_id: c++,java,c in sbki id

      //input output ko visibilityTestCases se uthaunga
      //stdin: means input
      //expectedOutput: means output

      const language_id = getLanguageById(language); //ye function ko utils me problemutility.js ke nam se banaya hai

      //here creating Batch submission  ,yaha pe c++ ka ek batch banrra hu uske saare testcases ko batch bana ke bhejra hu , aisehi for java and js
      const submissions = visibilityTestCases.map((testcase) => {
        const combinedStdin = testcase.target ? `${testcase.input}\n${testcase.target}` : testcase.input;

        console.log("\n\n\n================================ START DEBUG ================================");
        console.log("TestCase Input Raw:", JSON.stringify(testcase.input));
        console.log("TestCase Target Raw:", JSON.stringify(testcase.target));
        console.log("COMBINED STDIN RAW:", JSON.stringify(combinedStdin));
        console.log("================================ END DEBUG ================================\n\n\n");

        return {
          source_code: Buffer.from(completeCode).toString("base64"),
          language_id: language_id,
          stdin: Buffer.from(combinedStdin).toString("base64"),
          expected_output: Buffer.from(testcase.output).toString("base64"),
          base64_encoded: true
        };
      });

      const submitResult = await submitBatch(submissions); //ye function ko bhi utils me problemutility.js me banayenge 
      // console.log(submitResult);
      const resultToken = submitResult.map((value) => value.token);
      // console.log(resultToken)
      //["bgugebgerh","hfieruhfiu","hjgieuhgidh"] aise token ko map krenge arr me

      const testResult = await submitToken(resultToken); //jo token return me aya hai usko map kiya hai and phir se vahi tokens ko judg0 ko denge
      // console.log(testResult)
      //ab check krenge ki result kya aya hai
      //ab check krenge ki result kya aya hai
      for (const test of testResult) {
        if (test.status.id !== 3) { // 3 means Accepted
          console.error(`Judge0 Failed: ${test.status.description}`);
          console.error(`Expected: ${Buffer.from(test.expected_output || '', 'base64').toString('utf-8')}`);
          console.error(`Actual stdout: ${Buffer.from(test.stdout || '', 'base64').toString('utf-8')}`);
          console.error(`Compile Output: ${Buffer.from(test.compile_output || '', 'base64').toString('utf-8')}`);


          return res.status(400).send(`Code Execution Failed: ${test.status.description}. Check your backend terminal for Expected vs Actual output.`);
        }
      }
    }

    //if koi error nhi aaya to jo admin ne 3 languages ke ref solutn hai vo DB me store kara denge

    //konse user ne problem create kiya hai uski id bhi store karani padegi
    const userProblem = await Problem.create({
      ...req.body,
      problemCreator: req.result._id  //ye models se uthayenge admin ki id isliye import models->problems
    });

    res.status(201).send("Problem Saved Successfully");
  } catch (err) {
    res.status(400).send("Error:" + err.message);
  }
};


//2.updateProblem
const updateProblem = async (req, res) => {

  const { id } = req.params  // req.params se problem ki id nikalenge
  const {                //problem ki saari info nikal lenge
    title, description,
    Difficulty, tags, visibilityTestCases,
    hiddenTestCases, startCode, referenceSolution, problemCreator
  } = req.body;
  try {
    //upper ka hi pura code copy kiya hai


    //check kr lenge id barobar aayi hai ya nhi
    if (!id) {
      return res.status(400).send("Missing Id Field"); //return likhne se code uske aage nahi chelga
    }

    const DsaProblem = await Problem.findById(id);
    if (!DsaProblem) {
      return res.status(404).send("ID is not present in server")
    }


    for (const { language, completeCode } of referenceSolution) {

      const language_id = getLanguageById(language); //ye function ko utils me problemutility.js ke nam se banaya hai

      //here creating Batch submission  ,yaha pe c++ ka ek batch banrra hu uske saare testcases ko batch bana ke bhejra hu , aisehi for java and js
      const submissions = visibilityTestCases.map((testcase) => ({  //arr se value nikalenge
        source_code: completeCode,
        language_id: language_id,
        stdin: testcase.input,
        expected_output: testcase.output
      }));

      const submitResult = await submitBatch(submissions); //ye function ko bhi utils me problemutility.js me banayenge 
      // console.log(submitResult);
      const resultToken = submitResult.map((value) => value.token);
      // console.log(resultToken)
      //["bgugebgerh","hfieruhfiu","hjgieuhgidh"] aise token ko map krenge arr me

      const testResult = await submitToken(resultToken); //jo token return me aya hai usko map kiya hai and phir se vahi tokens ko judg0 ko denge
      // console.log(testResult)
      //ab check krenge ki result kya aya hai
      for (const test of testResult) {
        if (test.status_id != 3) {
          return res.status(400).send("Error Occured");
        }
      }
    }
    //req.body ke ander jo bhi data hai sbko update mara denge
    const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true }) //new:true means update ke baad jo bhi data milega vo return krdo
    //validator true means schema me jo hai uske beyond kuvh update na kre
    res.status(200).send(newProblem);
  }
  catch (err) {
    res.status(500).send("Error: " + err);
  }
}


//3.deleteProblem
const deleteProblem = async (req, res) => {

  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).send("Id is missing");
    }
    const deleteProblem = await Problem.findByIdAndDelete(id);

    if (!deleteProblem) {
      return res.status(404).send("Problem is missing");
    }

    res.status(200).send("Successfully Deleted");
  }
  catch (err) {
    res.status(500).send("Error: " + err);
  }
}


//4.getProblemById
const getProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    // FIX: Removed .select() to stop filtering out fields.
    // Added .lean() to get raw data from DB.
    const problemData = await Problem.findById(id).lean();

    if (!problemData) {
      return res.status(404).send("Problem not found");
    }

    const videoData = await SolutionVideo.findOne({ problemId: id });

    // Construct the final object
    const result = {
      ...problemData,
      secureUrl: videoData?.secureUrl || null,
      thumbnailUrl: videoData?.thumbnailUrl || null,
      duration: videoData?.duration || null,
    };

    // 🚀 Check your Terminal (Command Prompt) - see if it says 'startCode' or 'statrCode'
    console.log("Keys being sent to React:", Object.keys(result));

    res.status(200).json(result);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).send("Server Error");
  }
};


//5.getAllProblems
const getAllProblems = async (req, res) => {

  try {

    const getProblem = await Problem.find({}).select('_id title Difficulty tags'); //jitni bhi problems hogi vo sb fetch hoke ye empty object me aa jayegi

    if (getProblem.length == 0) {
      return res.status(404).send("Problem is missing");
    }

    res.status(200).send(getProblem);
  }
  catch (err) {
    res.status(500).send("Error: " + err);
  }
}


//6.solvedAllProblemsByUser
const solvedAllProblemByUser = async (req, res) => {
  try {
    //usermiddleware me already user ko fetch kara diya haito result ke ander uski sari info aa chuki hai

    //ye sirf count return ksarke derr tha
    // const count= req.result.problemSolved.length;
    // res.status(200).send(count);

    //ye problems bhi return krke dega 
    const userId = req.result._id;

    const user = await User.findById(userId).populate({
      path: "problemSolved",
      select: "_id title difficulty tags"
    })
    res.status(200).send(user.problemSolved);
  }
  catch (err) {
    res.status(500).send("Server Error:" + err)
  }
}

//7.particular problem ke submission 
const submittedProblem = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id; // ✅ FIXED: use id to match router

    // ✅ FIXED: Fetch history and sort by newest first
    const ans = await Submisssion.find({ userId, problemId }).sort({ createdAt: -1 });

    // ✅ FIXED: Removed the (ans.length == 0) block. 
    // Always send the data back to React.
    res.status(200).json(ans);
  }
  catch (err) {
    res.status(500).send("Internal server Error");
  }
}

module.exports = { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblems, solvedAllProblemByUser, submittedProblem };  //isko import controllers-> problemCreator.js me karayenge