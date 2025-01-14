const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const score = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    roomId: { type: String, required: true },
    score: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Score', score);