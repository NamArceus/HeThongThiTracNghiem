const teacherController = require('../controllers/teacherController');
const router = require('express').Router();
const {verifyTokenAndAdmin, verifyTokenAndRole} = require('../middlewares/verifyToken');

//REGISTER TEACHER
router.post('/registerTeacher', verifyTokenAndAdmin, teacherController.registerTeacher);


//LOGIN TEACHER
router.post('/loginTeacher', teacherController.loginTeacher);


//GET ALL TEACHERS
router.get('/getTeachers', teacherController.getTeachers);


//DELETE
router.delete('/deleteTeacher/:teacherId', verifyTokenAndAdmin, teacherController.deleteTeacher);


//GET CLASSES FOR TEACHER
router.get('/getClassesForTeacher', verifyTokenAndRole, teacherController.getClassesForTeacher);

//GET PROFILE TEACHER

router.get('/getTeacherProfile', verifyTokenAndRole, teacherController.getProfileTeacher);

//EDIT PROFILE TEACHER

router.patch('/editTeacherProfile/:teacherId', verifyTokenAndRole, teacherController.editProfileTeacher);


module.exports = router;