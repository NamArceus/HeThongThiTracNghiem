const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const testRoom = new Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    nameRoom: {
        type: String,
        required: true
    },
    duration: { 
        type: Number, 
        required: true 
    },
    completed: { 
        type: Boolean, 
        default: false
    },
    createdAt: {    
        type: Date,
        default: Date.now
    },
    students: [{studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Students',
        required: true
    },
    completed: { 
        type: Boolean, 
        default: false
    }}]
    
});

module.exports = mongoose.model('TestRoom', testRoom);