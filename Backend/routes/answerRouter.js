const answerController = require("../controllers/answerController");
const router = require("express").Router();
const {verifyToken, verifyTokenAndRole} = require("../middlewares/verifyToken");

//ADD ANSWER
router.post('/submitanswer', verifyTokenAndRole, answerController.submitAnswer);

//Get answer
router.get('/getstudentresult', verifyTokenAndRole, answerController.getStudentResult);

module.exports = router;