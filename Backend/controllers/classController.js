const Class = require("../models/Class");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Teacher = require("../models/Teachers");
const Student = require("../models/Students");

const classController = {

    //Get Class
    getClass: async (req, res) => {
        try {
            const classes = await Class.find();
            res.json(classes);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    //CREATE
    createClass: async (req,res) => {
        try {
            const { nameClass } = req.body;
            

            const newClass = new Class({
                nameClass: nameClass,
                
            });
            const savedClass = await newClass.save();
            res.status(201).json({success:true, message: "Class created successfully", classId: savedClass._id });
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    },

    //SIGN IN CLASS
    signinClass: async (req, res) => {
        try {
            const { nameClass, passwordClass } = req.body;
            const classFound = await Class.findOne({ nameClass });
            console.log(classFound);

            if(!classFound) {
                return res.status(404).json({ message: "Class not found" });
            }

            const validPassword = await bcrypt.compare(passwordClass, classFound.passwordClass);
            if(!validPassword) {
                return res.status(400).json({ message: "Invalid password" });
            }

            res.status(200).json({ message: "Class signed in successfully", classId: Class._id });
        } catch (error) {
            res.status(500).json({ message: "Sign in class error" });
        }
    },

    //ASSIGN TEACHER TO CLASS
    assignTeacherToClass: async (req, res) => {
        try {
            const { classId, teacherId } = req.body;
            if (!req.user || req.user.role !== "admin") {
                return res.status(403).json({ message: "Unauthorized: Only admin can assign" });
            }
    
            const classroom = await Class.findById(classId);
            if (!classroom) {
                return res.status(404).json({ message: "Class not found" });
            }
    
            const teacher = await Teacher.findById(teacherId);
            if (!teacher || teacher.role !== "teacher") {
                return res.status(404).json({ message: "Teacher not found or not a teacher" });
            }
            if (!classroom.teachers) {
                classroom.teachers = [];
            }
            
            if(!classroom.teachers.includes(teacher._id)) {
                classroom.teachers.push(teacher._id);
                await classroom.save();
                res.status(200).json({ message: "Teacher assigned successfully" });
            } else {
                return res.status(400).json({ message: "Teacher already assigned to this class" });
            }
        } catch (error) {
            res.status(500).json({ message: "Assign teacher to class error", error: error.message });
        }
    },
    

    //ASSIGN STUDENT TO CLASS
    assignStudentToClass: async (req, res) => {
        try {
            const { classId, studentId } = req.body;
            if (!req.user || req.user.role !== "admin") {
                return res.status(403).json({ message: "Unauthorized: Only admin can assign" });
            }
    
            const classroom = await Class.findById(classId);
            if (!classroom) {
                return res.status(404).json({ message: "Class not found" });
            }
    
            const student = await Student.findById(studentId);
            if (!student || student.role !== "student") {
                return res.status(404).json({ message: "Student not found or not a student" });
            }
            if (!classroom.students) {
                classroom.students = [];
            }
            
            if(!classroom.students.includes(student._id)) {
                classroom.students.push(student._id);
                await classroom.save();
                res.status(200).json({ message: "Student assigned successfully" });
            } else {
                return res.status(400).json({ message: "Student already assigned to this class" });
            }
        } catch (error) {
            res.status(500).json({ message: "Assign student to class error", error: error.message });
        }
    },
    
    //GET STUDENTS OF CLASS
    getStudentsInClass: async (req, res) => {
        try {
            const { classId } = req.query; // Lấy classId từ query parameters

            const classroom = await Class.findById(classId)
                .populate('students'); // Populate danh sách học sinh

            if (!classroom) {
                return res.status(404).json({ message: "Class not found" });
            }

            res.status(200).json({ success: true, students: classroom.students });
        } catch (error) {
            res.status(500).json({ message: "Error fetching students", error: error.message });
        }
    },

    
    
    //DELETE CLASS
    deleteClass: async (req, res) => {
        try {
            const deleteClass = await Class.findByIdAndDelete(req.params.classId);
            if (!deleteClass) {
                return res.status(404).json({ message: "Class not found" });
            }
            res.status(200).json({ message: "Class deleted successfully" });

        } catch (error) {
            res.status(500).json({ message: "Delete class fail" }); 
        }
    },

    kickTeacherFromClass: async (req, res) => {
            try {
                const { classId, teacherId } = req.query;
        
                // Tìm phòng theo classId
                const classid = await Class.findById(classId);
                if (!classid) {
                    return res.status(404).json({ message: "Class not found" });
                }
        
                // Kiểm tra xem học sinh có trong phòng không
                const teacherIndex = classid.teachers.findIndex(s => s._id.toString() === teacherId);
                if (teacherIndex === -1) {
                    return res.status(404).json({ message: "Teacher not found in this class" });
                }
        
                // Xóa học sinh khỏi phòng
                classid.teachers.splice(teacherIndex, 1);
                await classid.save();
        
                res.status(200).json({ message: "Teacher kicked from class successfully" });
            } catch (error) {
                res.status(500).json({ message: "Kick teacher from class error", error: error.message });
            }
        },
}

module.exports = classController;