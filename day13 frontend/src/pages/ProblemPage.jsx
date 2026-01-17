import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router'; // FIX: Used react-router-dom
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from "../components/SubmissionHistory"
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';

const langMap = {
    cpp: 'C++',
    java: 'Java',
    javascript: 'JavaScript'
};


const ProblemPage = () => {
    const [problem, setProblem] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    // 🚀 FIX: Replaced single 'loading' with two specific loading states
    // const [loading, setLoading] = useState(false); // OLD: Removed this single loading state
    const [isRunLoading, setIsRunLoading] = useState(false); // 🚀 NEW: State for the Run button
    const [isSubmitLoading, setIsSubmitLoading] = useState(false); // 🚀 NEW: State for the Submit button

    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [activeLeftTab, setActiveLeftTab] = useState('description');
    const [activeRightTab, setActiveRightTab] = useState('code');
    const [submissionRefreshKey, setSubmissionRefreshKey] = useState(0);
    const editorRef = useRef(null);
    let { problemId } = useParams();

    const { handleSubmit } = useForm();

    // Replaced the old setLoading logic for initial fetch with a local state or simplified logic
    // Since this is for the whole page load, we'll keep a temporary local loading variable for initial fetch/display
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const fetchProblem = async () => {
            setPageLoading(true); // Use dedicated page loading state for initial fetch
            try {
                const response = await axiosClient.get(`/problem/problemById/${problemId}`);

                console.log("Fetched Problem:", response.data);

                // 🚀 FIX 1: Safely handle the 'statrCode' typo and ensure it is an array before calling .find()
                const codeArray = response.data?.startCode || response.data?.statrCode;
                
                const initialCode = Array.isArray(codeArray)
                    ? codeArray.find(sc => sc.language === langMap[selectedLanguage])?.initialCode 
                    : '// Code template not found for this language.';

                setProblem(response.data);
                setCode(initialCode ?? '// No template available');
                setPageLoading(false); // Use dedicated page loading state for initial fetch

            } catch (error) {
                console.error('Error fetching problem:', error);
                setPageLoading(false); // Use dedicated page loading state for initial fetch
            }
        };

        fetchProblem();
    }, [problemId]); // NOTE: Removed selectedLanguage from here to prevent re-fetching the whole problem on lang change

    // Update code when language changes
  useEffect(() => {
    if (problem) {
        // Use the exact field name from your DB
        const codeArray = problem.startCode || problem.statrCode; 

        console.log("Checking codeArray:", codeArray);

        if (Array.isArray(codeArray) && codeArray.length > 0) {
            // Find logic
            const currentLang = selectedLanguage.toLowerCase(); // 'javascript', 'cpp', etc.
            
            const template = codeArray.find(item => {
                const dbLang = item.language.toLowerCase();
                // Match 'cpp' with 'c++' or 'cpp'
                if (currentLang === 'cpp' && dbLang.includes('c++')) return true;
                return dbLang === currentLang;
            });

            if (template) {
                console.log("Template Found:", template.initialCode);
                setCode(template.initialCode);
            } else {
                // FALLBACK: If we can't find a match, just show the first one available
                console.log("No exact match, loading first template as fallback");
                setCode(codeArray[0].initialCode);
            }
        }
    }
}, [problem, selectedLanguage]);

    const handleEditorChange = (value) => {
        setCode(value || '');
    };

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
    };

    // 🚀 FIX: Updated to use isRunLoading
    const handleRun = async () => {
        setIsRunLoading(true); // 🚀 CHANGE: Use run-specific loading state
        setRunResult(null);
        console.log("Running code:", { code, language: selectedLanguage });
        try {
            const response = await axiosClient.post(`/submission/run/${problemId}`, {
                code,
                language: selectedLanguage
            });

            setRunResult(response.data);
            setIsRunLoading(false); // CHANGE: Use run-specific loading state
            setActiveRightTab('testcase');

        } catch (error) {
            console.error('Error running code:', error);
            setRunResult({
                success: false,
                error: 'Internal server error'
            });
            setIsRunLoading(false); //  CHANGE: Use run-specific loading state
            setActiveRightTab('testcase');
        }
    };

    //  FIX: Updated to use isSubmitLoading
    const handleSubmitCode = async () => {
        setIsSubmitLoading(true); // CHANGE: Use submit-specific loading state
        setSubmitResult(null);

        try {
        const response = await axiosClient.post(`/submission/submit/${problemId}`, {
            code: code,
            language: selectedLanguage
        });

        setSubmitResult(response.data);
        setIsSubmitLoading(false);
        setActiveRightTab('result');

        // 🚀 IMPORTANT: Trigger refresh when submission is successful
        setSubmissionRefreshKey(prevKey => prevKey + 1);

        } catch (error) {
            console.error('Error submitting code:', error);
            setSubmitResult(null);
            setIsSubmitLoading(false); // 🚀 CHANGE: Use submit-specific loading state
            setActiveRightTab('result');
        }
    };

    const getLanguageForMonaco = (lang) => {
        switch (lang) {
            case 'javascript': return 'javascript';
            case 'java': return 'java';
            case 'cpp': return 'cpp';
            default: return 'javascript';
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'text-green-500';
            case 'medium': return 'text-yellow-500';
            case 'hard': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    // Use pageLoading for initial page-wide loader
    if (pageLoading && !problem) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-base-100">
            {/* Left Panel */}
            <div className="w-1/2 flex flex-col border-r border-base-300">
                {/* Left Tabs */}
                <div className="tabs tabs-bordered bg-base-200 px-4">
                    <button
                        className={`tab ${activeLeftTab === 'description' ? 'tab-active' : ''}`}
                        onClick={() => setActiveLeftTab('description')}
                    >
                        Description
                    </button>
                    <button
                        className={`tab ${activeLeftTab === 'editorial' ? 'tab-active' : ''}`}
                        onClick={() => setActiveLeftTab('editorial')}
                    >
                        Editorial
                    </button>
                    <button
                        className={`tab ${activeLeftTab === 'solutions' ? 'tab-active' : ''}`}
                        onClick={() => setActiveLeftTab('solutions')}
                    >
                        Solutions
                    </button>
                    <button
                        className={`tab ${activeLeftTab === 'submissions' ? 'tab-active' : ''}`}
                        onClick={() => setActiveLeftTab('submissions')}
                    >
                        Submissions
                    </button>

                    <button
                        className={`tab ${activeLeftTab === 'chatAI' ? 'tab-active' : ''}`}
                        onClick={() => setActiveLeftTab('chatAI')}
                    >
                        ChatAI
                    </button>


                </div>

                {/* Left Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {problem && (
                        <>
                            {activeLeftTab === 'description' && (
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <h1 className="text-2xl font-bold">{problem.title}</h1>
                                        <div className={`badge badge-outline ${getDifficultyColor(problem.Difficulty || '')}`}>
                                            {/* 🚀 FIX: Default to '' if problem.Difficulty is undefined */}
                                            { (problem.Difficulty || '').charAt(0).toUpperCase() + (problem.Difficulty || '').slice(1) }
                                        </div>
                                        <div className="badge badge-primary">{Array.isArray(problem.tags) ? problem.tags.join(', ') : problem.tags}</div>
                                    </div>

                                    <div className="prose max-w-none">
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {problem.description}
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-lg font-semibold mb-4">Examples:</h3>
                                        <div className="space-y-4">
                                            {/* Note: Added optional chaining ?. to prevent map crashes */}
                                            {problem.visibilityTestCases?.map((example, index) => ( 
                                                <div key={index} className="bg-base-200 p-4 rounded-lg">
                                                    <h4 className="font-semibold mb-2">Example {index + 1}:</h4>
                                                    <div className="space-y-2 text-sm font-mono">
                                                        <div><strong>Input:</strong> {example.input}</div>
                                                        <div><strong>Output:</strong> {example.output}</div>
                                                        <div><strong>Explanation:</strong> {example.explaination}</div> 
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeLeftTab === 'editorial' && (
                                <div className="prose max-w-none">
                                    <h2 className="text-xl font-bold mb-4">Editorial</h2>
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                      {/* Inside ProblemPage.jsx */}
                                        {problem?.secureUrl ? (
                                        <Editorial 
                                            key={problem.secureUrl} // 🚀 This is the MAGIC. It forces a full reload when the URL changes.
                                            secureUrl={problem.secureUrl} 
                                            thumbnailUrl={problem.thumbnailUrl} 
                                                                                    />
                                            ) : (
                                            <p>No video available for this problem.</p>
                                            )}
                                    </div>
                                </div>
                            )}

                            {activeLeftTab === 'solutions' && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4">Solutions</h2>
                                    <div className="space-y-6">
                                        {problem.referenceSolution?.map((solution, index) => (
                                            <div key={index} className="border border-base-300 rounded-lg">
                                                <div className="bg-base-200 px-4 py-2 rounded-t-lg">
                                                    <h3 className="font-semibold">{problem?.title} - {solution?.language}</h3>
                                                </div>
                                                <div className="p-4">
                                                    <pre className="bg-base-300 p-4 rounded text-sm overflow-x-auto">
                                                        <code>{solution?.completeCode}</code>
                                                    </pre>
                                                </div>
                                            </div>
                                        )) || <p className="text-gray-500">Solutions will be available after you solve the problem.</p>}
                                    </div>
                                </div>
                            )}

                            {activeLeftTab === 'submissions' && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4">My Submissions</h2>
                                    <div className="text-gray-500">
                                    <SubmissionHistory 
                                     problemId={problemId} 
                                          refreshTrigger={submissionRefreshKey} // 🚀 Pass the new state here
                                    />
                                    </div>
                                </div>
                            )}

                            {activeLeftTab === 'chatAI' && (
                                <div className="prose max-w-none">
                                    <h2 className="text-xl font-bold mb-4">CHAT with AI</h2>
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        <ChatAi problem={problem}></ChatAi>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-1/2 flex flex-col">
                {/* Right Tabs */}
                <div className="tabs tabs-bordered bg-base-200 px-4">
                    <button
                        className={`tab ${activeRightTab === 'code' ? 'tab-active' : ''}`}
                        onClick={() => setActiveRightTab('code')}
                    >
                        Code
                    </button>
                    <button
                        className={`tab ${activeRightTab === 'testcase' ? 'tab-active' : ''}`}
                        onClick={() => setActiveRightTab('testcase')}
                    >
                        Testcase
                    </button>
                    <button
                        className={`tab ${activeRightTab === 'result' ? 'tab-active' : ''}`}
                        onClick={() => setActiveRightTab('result')}
                    >
                        Result
                    </button>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col">
                    {activeRightTab === 'code' && (
                        <div className="flex-1 flex flex-col">
                            {/* Language Selector */}
                            <div className="flex justify-between items-center p-4 border-b border-base-300">
                                <div className="flex gap-2">
                                    {['javascript', 'java', 'cpp'].map((lang) => (
                                        <button
                                            key={lang}
                                            className={`btn btn-sm ${selectedLanguage === lang ? 'btn-primary' : 'btn-ghost'}`}
                                            onClick={() => handleLanguageChange(lang)}
                                        >
                                            {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Monaco Editor */}
                            <div className="flex-1">
                                <Editor
                                    height="100%"
                                    language={getLanguageForMonaco(selectedLanguage)}
                                    value={code}
                                    onChange={handleEditorChange}
                                    onMount={handleEditorDidMount}
                                    theme="vs-dark"
                                    options={{
                                        fontSize: 14,
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 2,
                                        insertSpaces: true,
                                        wordWrap: 'on',
                                        lineNumbers: 'on',
                                        renderLineHighlight: 'line',
                                        selectOnLineNumbers: true,
                                    }}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="p-4 border-t border-base-300 flex justify-between">
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => setActiveRightTab('testcase')}
                                    >
                                        Console
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className={`btn btn-outline btn-sm ${isRunLoading ? 'loading' : ''}`}
                                        onClick={handleRun}
                                        disabled={isRunLoading || isSubmitLoading} 
                                    >
                                        Run
                                    </button>
                                    <button
                                        className={`btn btn-primary btn-sm ${isSubmitLoading ? 'loading' : ''}`}
                                        onClick={handleSubmitCode}
                                        disabled={isRunLoading || isSubmitLoading} 
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeRightTab === 'testcase' && (
                        <div className="flex-1 p-4 overflow-y-auto">
                            <h3 className="font-semibold mb-4">Test Results</h3>
                            {isRunLoading && ( 
                                <div className="flex justify-center items-center h-full">
                                    <span className="loading loading-spinner loading-md"></span>
                                    <p className="ml-2">Running tests...</p>
                                </div>
                            )}

                            {!isRunLoading && runResult ? (
                                <div className={`alert ${runResult.success ? 'alert-success' : 'alert-error'} mb-4`}>
                                    <div>
                                        {runResult.success ? (
                                            <div>
                                                <h4 className="font-bold">✅ All test cases passed!</h4>
                                                <p className="text-sm mt-2">Runtime: {runResult.runtime + " sec"}</p>
                                                <p className="text-sm">Memory: {runResult.memory + " KB"}</p>

                                                <div className="mt-4 space-y-2">
                                                    {runResult.testCases?.map((tc, i) => (
                                                        <div key={i} className="bg-base-100 p-3 rounded text-xs">
                                                            <div className="font-mono">
                                                                <div><strong>Input:</strong> {tc.stdin}</div>
                                                                <div><strong>Expected:</strong> {tc.expected_output}</div>
                                                                <div><strong>Output:</strong> {tc.stdout}</div>
                                                                <div className={'text-green-600'}>
                                                                    {'✓ Passed'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <h4 className="font-bold">❌ Error</h4>
                                                <div className="mt-4 space-y-2">
                                                    {runResult.testCases?.map((tc, i) => (
                                                        <div key={i} className="bg-base-100 p-3 rounded text-xs">
                                                            <div className="font-mono">
                                                                <div><strong>Input:</strong> {tc.stdin}</div>
                                                                <div><strong>Expected:</strong> {tc.expected_output}</div>
                                                                <div><strong>Output:</strong> {tc.stdout}</div>
                                                                <div className={tc.status_id == 3 ? 'text-green-600' : 'text-red-600'}>
                                                                    {tc.status_id == 3 ? '✓ Passed' : '✗ Failed'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                !isRunLoading && ( 
                                    <div className="text-gray-500">
                                        Click "Run" to test your code with the example test cases.
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {activeRightTab === 'result' && (
                        <div className="flex-1 p-4 overflow-y-auto">
                            <h3 className="font-semibold mb-4">Submission Result</h3>
                             {isSubmitLoading && ( 
                                <div className="flex justify-center items-center h-full">
                                    <span className="loading loading-spinner loading-md"></span>
                                    <p className="ml-2">Submitting solution...</p>
                                </div>
                            )}

                            {!isSubmitLoading && submitResult ? (
                                <div className={`alert ${submitResult.accepted ? 'alert-success' : 'alert-error'}`}>
                                    <div>
                                        {submitResult.accepted ? (
                                            <div>
                                                <h4 className="font-bold text-lg">🎉 Accepted</h4>
                                                <div className="mt-4 space-y-2">
                                                    <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                                                    <p>Runtime: {submitResult.runtime + " sec"}</p>
                                                    <p>Memory: {submitResult.memory + "KB"} </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <h4 className="font-bold text-lg">❌ {submitResult.error}</h4>
                                                <div className="mt-4 space-y-2">
                                                    <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                !isSubmitLoading && ( 
                                    <div className="text-gray-500">
                                        Click "Submit" to submit your solution for evaluation.
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProblemPage;