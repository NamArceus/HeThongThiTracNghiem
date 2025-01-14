const router = require("express").Router();
const TestRoomController = require("../controllers/TestRoomController");
const {verifyTokenAndRole} = require("../middlewares/verifyToken");

//Create
router.post('/createTestRoom', verifyTokenAndRole, TestRoomController.createTestRoom);

//Get
router.get('/getTestRoom',verifyTokenAndRole, TestRoomController.getTestRoom);

//
router.get('/getRoomForClass',verifyTokenAndRole, TestRoomController.getRoomForClass);

//GET STUDENTS IN ROOM
router.get('/getRoomInClass',verifyTokenAndRole, TestRoomController.getRoomInClass);

//ADD STUDENT TO ROOM
router.post('/addStudentToRoom',verifyTokenAndRole, TestRoomController.addStudentToRoom);

//KICK STUDENT
router.delete('/kickStudent',verifyTokenAndRole, TestRoomController.kickStudentFromRoom);

//delete
router.delete('/deleteTestRoom/:roomId', verifyTokenAndRole, TestRoomController.deleteTestRoom);

//update status
router.patch('/updateStatus',verifyTokenAndRole, TestRoomController.updateTestRoomStatus);

//Get room status
router.get('/getRoomStatus',verifyTokenAndRole, TestRoomController.getRoomStatus);

module.exports = router;