const Joi = require('joi');

const registerValidation = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    //role: Joi.string().valid('admin','guest').required()
});


const loginValidation = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});


module.exports = {
    registerValidation,
    loginValidation   
};