const classController = require("../controllers/classController");
const { verifyTokenAndUserAuthorization, verifyTokenAndAdmin, verifyToken, verifyTokenAndRole } = require("../middlewares/verifyToken");
const router = require("express").Router();

//GET ALL CLASS
router.get('/getclass', classController.getClass);

//CREATE CLASS
router.post('/createclass', verifyTokenAndAdmin, classController.createClass);

//SIGN IN CLASS
router.post('/signinclass', verifyToken, classController.signinClass);

//ASSIGN TEACHER
router.patch("/assignteacher", verifyTokenAndAdmin, classController.assignTeacherToClass);

//ASSIGN STUDENT
router.patch("/assignstudent", verifyTokenAndAdmin, classController.assignStudentToClass);

//GET STUDENT IN CLASS
router.get("/getStudentsInClass", verifyTokenAndRole, classController.getStudentsInClass);

//DELETE CLASS
router.delete('/deleteclass/:classId', verifyTokenAndAdmin, classController.deleteClass);

//KICK TEACHER
router.delete('/kickteacher', verifyTokenAndAdmin, classController.kickTeacherFromClass);

module.exports = router;