const mongoose = require('mongoose');
const { Schema } = mongoose;

const problemSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    Difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    tags: {
        type: String,
        enum: ['array', 'linkedList', 'graph', 'tree', 'dp'],
        required: true
    },
    visibilityTestCases: [ //inko arr ke ander rakha hua hai
        {
            input: {
                type: String,
                required: true,
            },
            output: {
                type: String,
                required: true,
            },
            explaination: {
                type: String,
                required: false,
            },
            image: {
                type: String,
                required: false
            },
            target: {
                type: String,
                required: false
            }
        }
    ],

    hiddenTestCases: [
        {
            input: {
                type: String,
                required: true,
            },
            output: {
                type: String,
                required: true,
            },

        }
    ],

    startCode: [     //jo prebuilt functions hote hai problems ke   like Class solution
        {
            language: {
                type: String,
                required: true,
            },
            initialCode: {    //like Class Solution in Cpp
                type: String,
                required: true,
            }
        }
    ],

    referenceSolution: [  //hum provide krte hai reference ke liye , ek solution to user submit krega and ye apna soltion ref ke har language me rahega
        {
            language: {
                type: String,
                required: true,
            },
            completeCode: {    //like Class Solution in Cpp
                type: String,
                required: true,
            }
        }
    ],
    /*  jb for of loop lagayenge to language and completecode nikalenge to vo yaha se niklenge for of loop userProblem.js me likha hai
const referenceSolution=[
    {
        language:"C++",
        completeCode:"C++ Code"
    },
    {
        language:"java",
        completeCode:"Java Code"
    },
    {
        language:"js",
        completeCode:"JS Code"

    }
]
    */
    problemCreator: {      //konse admin ne ye problem create ki hai
        type: Schema.Types.ObjectId,
        ref: 'user',   //DB me refer krega user ko using objId (whch is  unique)
        required: true,
    }


})

const Problem = mongoose.model('problem', problemSchema);
module.exports = Problem;
