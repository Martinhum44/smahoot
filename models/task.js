const aMONGOOSE = require("mongoose")

const quizModel = new aMONGOOSE.Schema({
    questions:{
        type: [Object],
        required: [true, "questions were not provided"]
    },
    name:{
        type: String,
        required: [true, "name was not provided"],
        maxlength: [50, "name cannot be greater than 50 characters"]
    },
    quizId:{
        type:String,
        default: String(Math.floor(Math.random()*10**16)),
        maxlength: [20, "QuizId cannot be longer than 16 characters"]
    }
})

module.exports = {quiz: aMONGOOSE.model("Quiz",quizModel)}