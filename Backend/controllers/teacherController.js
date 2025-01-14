const Teacher = require('../models/Teachers');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Class = require('../models/Class');
const {registerValidation, loginValidation} = require("../middlewares/Validator");
const mongoose = require('mongoose');
const { getProfile, editProfile } = require('./userController');

const teacherController = {
    registerTeacher: async (req, res) => {
        try {
            const {firstName, lastName, username, password, /*role*/} = req.body;
            
            const {error} = registerValidation.validate(req.body);
            if (error) return res.status(400).json(error.details[0].message);

            //Kiểm tra xem có đăng ký trùng username
            const existingUser = await Teacher.findOne({username});
            if (existingUser) {
                return res.status(400).json({ message: "Username already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const newTeacher = new Teacher({
                firstName,
                lastName,
                username,
                password: hashedPassword,
                //role
            });
            const savedTeacher = await newTeacher.save();
            res.status(200).json({success: true, message: "User registered successfully", teacherId: savedTeacher._id});
        } catch (error) {
            console.error(error);
            res.status(500).json({success: false, message: "Register error" });
        }
    },

    //LOGIN
    loginTeacher: async (req, res) => {
        try {
            const { username, password } = req.body; 
            if(!username || !password) {
                return res.status(400).json({ message: "Please provide both username and password" });
            }


            const {error} = loginValidation.validate(req.body);
            if (error) return res.status(400).json(error.details[0].message);
            const user = await Teacher.findOne({ username: username }); 
    
            if (!user) {
                return res.status(400).json({ message: "Invalid username" });
            }
    
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: "Invalid password" });
            }
    
            const accessToken = jwt.sign(
                { userId: user._id, username: user.username, role: user.role},
                process.env.JWT_ACCESS_TOKEN_SECRET,
                { expiresIn: '30m' }
            );
    
            const refreshToken = jwt.sign(
                { userId: user._id, username: user.username, role: user.role},
                process.env.JWT_REFRESH_TOKEN_SECRET,
                { expiresIn: '7d' }
            );
    
            // Lưu Refresh Token vào cơ sở dữ liệu
            user.refreshToken = refreshToken;
            const savedTeacher = await user.save();  // Cập nhật thông tin người dùng trong DB
    
            res.status(200).json({ user, accessToken, teacherId: savedTeacher._id});
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Login error" });
        }
    },

    //GET ALL TEACHERS
    getTeachers: async (req, res) => {
        try {
            const teachers = await Teacher.find();
            res.status(200).json(teachers);
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    },



    //DELETE TEACHER
    deleteTeacher: async (req, res) => {
        try {
            const user = await Teacher.findByIdAndDelete(req.params.teacherId);
            if(!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({ message: "Teacher deleted successfully" });
        } catch (err) {
            res.status(500).json(err);
        }
    },

    
    //GET CLASSES FOR TEACHER
    getClassesForTeacher: async (req, res) => {
        const teacherId = req.query.teacherId;
        if (!teacherId) {
            return res.status(400).json({ success: false, message: "Teacher ID is required" });
        }

        try {
            const teacherId = new mongoose.Types.ObjectId(req.query.teacherId);

            const classes = await Class.find({ 'teachers': teacherId });

            if (classes && classes.length > 0) {
                res.status(200).json({ success: true, data: classes });
            } else {
                res.status(404).json({ success: false, message: "No classes found for this teacher" });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: "An error occurred while retrieving data", error: error.message });
        }
    },

    //GET PROFILE TEACHER
    getProfileTeacher: async (req, res) => {
        const teacherId = req.query.teacherId;
        if (!teacherId) {
            return res.status(400).json({ success: false, message: "Teacher ID is required" });
        }
        try {
            const teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({ success: false, message: "Teacher not found" });
            }
            res.status(200).json({ success: true, data: teacher });
        } catch (error) {
            res.status(500).json({ success: false, message: "An error occurred while retrieving data", error: error.message });
        }
    },

    //EDIT PROFILE TEACHER
    editProfileTeacher: async (req, res) => {
        try {
            const { firstName, lastName, username } = req.body;
            const teacherId = req.params.teacherId;
                    
            const teacher = await Teacher.findByIdAndUpdate(teacherId, { firstName, lastName, username }, { new: true });
                    
            if(!teacher) {
                return res.status(404).json({ message: "Teacher not found" });
            }
        
            res.status(200).json({ message: "Profile updated successfully" });
        
        } catch (error) {
            res.status(500).json({ message: "Error updating profile", error: error.message });
        }
    },



    //REQUEST REFRESH TOKEN
    refreshToken: async (req, res) => {
        const {refreshToken} = req.body;
        if(!refreshToken) {
            return res.status(401).json({message: "No refresh token provided"});
        }

        try {
            const user = await Teacher.findOne({ refreshToken });  
            if (!user) return res.status(403).json({ message: "Refresh Token invalid" });

            jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, (err) => {
                if (err) return res.status(403).json({ message: "Refresh Token invalid" });

                const accessToken = jwt.sign(
                    { userId: user.id, username: user.username },
                    process.env.JWT_ACCESS_TOKEN_SECRET,
                    { expiresIn: '30m' }  
                );

                res.json({ accessToken });  // Trả về access token mới cho client
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('server error'); 
        }
    }
}

module.exports = teacherController;