const scoreController = require("../controllers/scoreController");
const { verifyTokenAndRole } = require("../middlewares/verifyToken");
const router = require("express").Router();

//save score
router.post('/savescore', scoreController.saveScore);

//get score all student
router.get('/getScoreAllStudent',verifyTokenAndRole ,scoreController.getScoreAllStudent);

module.exports = router;