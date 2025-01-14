const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { USER_ROLES } = require('../utils/constant');

const student = new Schema({
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
        default: USER_ROLES.STUDENT
    },
})

module.exports = mongoose.model('Student',student);