const Student = require('../models/Students');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {registerValidation, loginValidation} = require("../middlewares/Validator");
const mongoose = require('mongoose');
const Class = require('../models/Class');
const { editProfile } = require('./userController');

const studentController = {
    registerStudent: async (req, res) => {
        try {
            const {firstName, lastName, username, password, /*role*/} = req.body;
            
            const {error} = registerValidation.validate(req.body);
            if (error) return res.status(400).json(error.details[0].message);

            //Kiểm tra xem có đăng ký trùng username
            const existingUser = await Student.findOne({username});
            if (existingUser) {
                return res.status(400).json({ message: "Username already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const newStudent = new Student({
                firstName,
                lastName,
                username,
                password: hashedPassword,
                //role
            });
           const savedStudent = await newStudent.save();
            res.status(200).json({success: true, message: "Student registered successfully", studentId: savedStudent._id});
        } catch (error) {
            console.error(error);
            res.status(500).json({success: false, message: "Register error" });
        }
    },

    //LOGIN
    loginStudent: async (req, res) => {
        try {
            const { username, password } = req.body; // Lấy username và password từ request body
            if(!username || !password) {
                return res.status(400).json({ message: "Please provide both username and password" });
            }

            const {error} = loginValidation.validate(req.body);
            if (error) return res.status(400).json(error.details[0].message);
            const user = await Student.findOne({ username: username }); // Sử dụng User model để tìm user
    
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
            const savedStudent = await user.save();  // Cập nhật thông tin người dùng trong DB
    
            res.status(200).json({ user, accessToken, studentId: savedStudent._id});
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Login error" });
        }
    },


    //GET STUDENT
    getStudents: async (req, res) => {
        try {
            const students = await Student.find();
            res.status(200).json(students);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },


    //DELETE STUDENT
    deleteStudent: async (req, res) => {
        try {
            const user = await Student.findByIdAndDelete(req.params.studentId);
            if(!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({ message: "Student deleted successfully" });
        } catch (err) {
            res.status(500).json(err);
        }
    },


    //GET STUDENT FOR CLASS
    getClassesForStudent: async (req, res) => {
        const studentId = req.query.studentId;
        if (!studentId) {
            return res.status(400).json({ success: false, message: "Student ID is required" });
        }

        try {
            const studentId = new mongoose.Types.ObjectId(req.query.studentId);

            const classes = await Class.find({ 'students': studentId });

            if (classes && classes.length > 0) {
                res.status(200).json({ success: true, data: classes });
            } else {
                res.status(404).json({ success: false, message: "No classes found for this teacher" });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: "An error occurred while retrieving data", error: error.message });
        }
    },


    //REQUEST REFRESH TOKEN
    refreshToken: async (req, res) => {
        const {refreshToken} = req.body;
        if(!refreshToken) {
            return res.status(401).json({message: "No refresh token provided"});
        }

        try {
            const user = await Student.findOne({ refreshToken });  
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
    },

    //GET PROFILE STUDENT
    getProfileStudent: async (req, res) => {
        try {
            const studentId = req.params.studentId;
            if (!studentId) {
                return res.status(400).send({ message: "Student ID is required" });
            }
            const student = await Student.findById(studentId); 
            if (!student) {
                return res.status(404).send({ message: "Student not found" });
            }
            res.status(200).send({
                message: "STudent profile retrieved successfully",
                data: student
            });
        } catch (error) {
            res.status(500).send({
                message: "Server error",
                error: error.message
            });
        }
    },

    //EDIT PROFILE STUDENT
    editProfileStudent: async (req, res) => {
        try {
            const { firstName, lastName, username } = req.body;
            const studentId = req.params.studentId;
                    
            const student = await Student.findByIdAndUpdate(studentId, { firstName, lastName, username }, { new: true });
                    
            if(!student) {
                return res.status(404).json({ message: "Student not found" });
            }
        
            res.status(200).json({ message: "Profile updated successfully" });
        
        } catch (error) {
            res.status(500).json({ message: "Error updating profile", error: error.message });
        }
    }
}

module.exports = studentController;