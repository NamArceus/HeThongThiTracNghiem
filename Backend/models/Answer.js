const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    answers: [{ questionId: String, selectOption: Number }],
    score: { type: Number, required: true },
}, { timestamps: true });

const Answer = mongoose.model('Answer', answerSchema);
module.exports = Answer;