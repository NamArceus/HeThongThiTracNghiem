const mongoose = require('mongoose');
const {USER_ROLES} = require('../utils/constant');
const Schema = mongoose.Schema;

const teacher = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.TEACHER
    },
    
})

module.exports = mongoose.model('Teacher', teacher);