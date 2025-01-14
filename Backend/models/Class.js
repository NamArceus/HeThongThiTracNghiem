const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newClass = new Schema ({
    nameClass: {
        type: String,
        required: true
    },
    teachers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    students: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Student',
        default: []
    }
})

module.exports = mongoose.model('Class', newClass);