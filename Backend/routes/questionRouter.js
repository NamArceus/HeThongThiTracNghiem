const questionController = require("../controllers/questionController");
const { verifyTokenAndRole } = require("../middlewares/verifyToken");
const router = require("express").Router();

// CREATE
router.post("/createquestion", verifyTokenAndRole, questionController.createQuiz);

// EDIT
router.patch("/editquestion/:id", verifyTokenAndRole, questionController.editQuiz);

//GET QUESTION
router.get("/getquestion/:roomId",verifyTokenAndRole, questionController.getQuestion);

// DELETE
router.delete("/deletequestion/:questionId", verifyTokenAndRole, questionController.deleteQuiz);

module.exports = router;