const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const question = new Schema ({
    questionType: {
        type: String,
        enum: ['multiple-choice'],
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    options: {
        type: [{
            text: { type: String, required: true },
            isCorrect: { type: Boolean, required: true }
        }],
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestRoom'
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    createBy: {
        type: Schema.Types.ObjectId,
        ref: 'Teachers'
    }
})
module.exports = mongoose.model("Quiz",question);