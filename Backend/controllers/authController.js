const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {registerValidation, loginValidation} = require("../middlewares/Validator");

const authController = {
    //REGISTER
    registerUser: async (req, res) => {
        try {
            const {firstName, lastName, username, password, /*role*/} = req.body;
            
            const {error} = registerValidation.validate(req.body);
            if (error) return res.status(400).json(error.details[0].message);

            //Kiểm tra xem có đăng ký trùng username
            const existingUser = await User.findOne({username});
            if (existingUser) {
                return res.status(400).json({ message: "Username already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const newUser = new User({
                firstName,
                lastName,
                username,
                password: hashedPassword,
                //role
            });
            await newUser.save();
            res.status(200).json({success: true, message: "User registered successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({success: false, message: "Register error" });
        }
    },


    
    //LOGIN
    loginUser: async (req, res) => {
        try {
            const { username, password } = req.body; // Lấy username và password từ request body

            const {error} = loginValidation.validate(req.body);
            if (error) return res.status(400).json(error.details[0].message);
            const user = await User.findOne({ username: username }); // Sử dụng User model để tìm user
    
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
            const savedUser = await user.save();  // Cập nhật thông tin người dùng trong DB
    
            res.status(200).json({ user, accessToken, userId: savedUser._id });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Login error" });
        }
    },


    //REQUEST REFRESH TOKEN
    refreshToken: async (req, res) => {
        const {refreshToken} = req.body;
        if(!refreshToken) {
            return res.status(401).json({message: "No refresh token provided"});
        }

        try {
            const user = await User.findOne({ refreshToken });  
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
    }
}

module.exports = authController;