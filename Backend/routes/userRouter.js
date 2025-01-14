const userController = require("../controllers/userController");
const { verifyTokenAndAdmin, verifyTokenAndUserAuthorization, verifyToken } = require("../middlewares/verifyToken");
const upload = require("../multer");
const router = require("express").Router();

//GET ALL USER
router.get('/user', userController.getAllUser);

//
router.get('/getprofile/:userId' ,verifyToken, userController.getProfile);

//DELETE
router.delete('/delete/:id',verifyTokenAndAdmin , userController.deleteUser);

//UPDATE
router.patch('/update',verifyTokenAndUserAuthorization , userController.updateUser);

//UPDATE ROLE
router.put('/updaterole/:id', verifyTokenAndAdmin, userController.updateRoleUser);

//EDIT PROFILE
router.patch('/editprofile/:userId', verifyTokenAndUserAuthorization, userController.editProfile);

//UPLOAD
router.post('/upload', upload.array('files', 10), userController.uploadAvatar);


module.exports = router;