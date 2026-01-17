const Problem = require('../models/problems'); 
const Submission = require('../models/submission');
const User = require('../models/user'); // added from above code (not used directly but kept as in original)
const { getLanguageById, submitBatch, submitToken } = require('../utils/problemutiliy'); // ✅ Correct import

const submitCode = async (req, res) => {
  try {
    // jb code submit hoga
    const userId = req.result._id; 
    const problemId = req.params.id; // params se milta hai problemId
    let { code, language } = req.body; // frontend se submit hoga

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some fields are missing");

    // normalize language like in the original code
    if (language === 'cpp') language = 'c++';

    // fetch the problem from DB kyuki hidden test cases pata krna hai
    const problem = await Problem.findById(problemId);
    if (!problem)
      return res.status(404).send("Problem not found");

    const hiddenTestCases = problem.hiddenTestCases || [];
    if (!Array.isArray(hiddenTestCases) || hiddenTestCases.length === 0)
      return res.status(400).send("No hidden test cases found for this problem");

    // submission ko pehle DB me store karayenge
    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      testCasesPassed: 0,
      status: 'pending',
      testCasesTotal: hiddenTestCases.length
    });

    // Judge0 ko code submit krna hai
    const language_id = getLanguageById(language);
    if (!language_id)
      return res.status(400).send("Unsupported language");

    const submissions = hiddenTestCases.map((testcase) => ({
      source_code: code,
      language_id: language_id,
      stdin: testcase.input,
      expected_output: testcase.output
    }));

    // Send code to Judge0
    const batchResult = await submitBatch(submissions);
    const resultToken = batchResult.map((v) => v.token);
    const testResult = await submitToken(resultToken); // final results from Judge0

    // Results ko analyze karo
    let testCasePassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id === 3) { // ✅ Success
        testCasePassed++;
        runtime += parseFloat(test.time || 0);
        memory = Math.max(memory, test.memory || 0);
      } else {
        status = test.status_id === 4 ? 'error' : 'wrong';
        errorMessage = test.stderr || test.compile_output || 'Unknown error';
      }
    }

    // Update DB submission result
    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasePassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();

    //problemId ko insert karenge userSchema ke problemSolved me if it is not present there
    //req.result ke ander user ki info hai
    if (!req.result.problemSolved.includes(problemId)) {
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    const accepted = (status === 'accepted');
    res.status(201).json({
      accepted,
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasePassed,
      runtime,
      memory
    });

  } catch (err) {
    console.error("❌ Internal server error:", err);
    res.status(500).send("Internal server error: " + err.message);
  }
};
const runCode = async (req, res) => {
  try {
    const userId = req.result._id; 
    const problemId = req.params.id;
    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some fields are missing");

    // normalize language like in the original code
    if (language === 'cpp') language = 'c++';

    // Fetch problem from DB
    const problem = await Problem.findById(problemId);
    if (!problem)
      return res.status(404).send("Problem not found");

    // support both possible property names (visibleTestCases / visibilityTestCases) — added fallback from above code
    const visibilityTestCases = problem.visibleTestCases || problem.visibilityTestCases || [];
    if (!Array.isArray(visibilityTestCases) || visibilityTestCases.length === 0)
      return res.status(400).send("No visible test cases found for this problem");

    // Judge0 setup
    const language_id = getLanguageById(language);
    if (!language_id)
      return res.status(400).send("Unsupported language");

    const submissions = visibilityTestCases.map((testcase) => ({
      source_code: code,
      language_id: language_id,
      stdin: testcase.input,
      expected_output: testcase.output
    }));

    // Send code to Judge0
    const batchResult = await submitBatch(submissions);
    const resultToken = batchResult.map((v) => v.token);
    const testResult = await submitToken(resultToken);

    // analyze visible test results similar to submitCode
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let success = true;
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id === 3) {
        testCasesPassed++;
        runtime += parseFloat(test.time || 0);
        memory = Math.max(memory, test.memory || 0);
      } else {
        success = false;
        errorMessage = test.stderr || test.compile_output || 'Unknown error';
      }
    }

    res.status(201).json({
      success,
      testCases: testResult,
      runtime,
      memory
    });
  } 
  catch (err) {
    console.error("❌ Internal server error:", err);
    res.status(500).send("Internal server error: " + err.message);
  }
};


module.exports = { submitCode, runCode };
