const studentController = require('../controllers/studentController');
const router = require("express").Router();
const {verifyTokenAndAdmin, verifyTokenAndRole} = require('../middlewares/verifyToken');

//REGISTER
router.post('/registerStudent', verifyTokenAndAdmin, studentController.registerStudent);

//LOGIN
router.post('/loginStudent', studentController.loginStudent);

//GET ALL STUDENT
router.get('/getStudents', studentController.getStudents);

//DELETE
router.delete('/deleteStudent/:studentId', verifyTokenAndAdmin, studentController.deleteStudent);

//GET CLASSES FOR STUDENT
router.get('/getClassesForStudent', verifyTokenAndRole, studentController.getClassesForStudent);

//GET STUDENT PROFILE
router.get('/getProfileStudent/:studentId', verifyTokenAndRole, studentController.getProfileStudent);

//EDIT PROFILE STUDENT
router.patch('/editProfileStudent/:studentId', verifyTokenAndRole, studentController.editProfileStudent);

module.exports = router;