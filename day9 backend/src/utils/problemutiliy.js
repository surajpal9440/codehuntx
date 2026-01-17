const axios = require('axios');

// --------------------- GET LANGUAGE BY ID ---------------------

const getLanguageById = (lang) => {
  const language = {
    "c++": 54,
    "java": 62,
    "javascript": 63
  };

  return language[lang.toLowerCase()];
};


// --------------------- SUBMIT BATCH ---------------------

const submitBatch = async (submissions) => {

  // har submission ke liye language_id zaroor hona chahiye
  const updatedSubmissions = submissions.map((s) => ({
    language_id: s.language_id || 63,
    source_code: s.source_code,          // already base64
    stdin: s.stdin,                      // already base64
    expected_output: s.expected_output   // already base64
  }));

  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      base64_encoded: 'true'   // ✅ FIXED
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: { submissions: updatedSubmissions }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error("❌ Error in submitBatch:", error.response?.data || error.message);
      return null;
    }
  }

  const result = await fetchData();
  return result;
};


// --------------------- SUBMIT TOKEN ---------------------

const submitToken = async (resultToken) => {

  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: resultToken.join(","),
      base64_encoded: 'true',   // ✅ FIXED
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    }
  };

  const waiting = async (timer) => {
    return new Promise((resolve) => setTimeout(resolve, timer));
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error("❌ Error in submitToken:", error.response?.data || error.message);
      return null;
    }
  }

  while (true) {
    const result = await fetchData();

    if (!result || !result.submissions) {
      await waiting(1000);
      continue;
    }

    const IsResultObtained = result.submissions.every(
      (r) => r.status && r.status.id > 2
    );

    if (IsResultObtained) return result.submissions;

    await waiting(1000);
  }
};


// --------------------- EXPORTS ---------------------

module.exports = { getLanguageById, submitBatch, submitToken };
