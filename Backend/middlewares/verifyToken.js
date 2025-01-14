const jwt = require("jsonwebtoken");

// Middleware để xác thực token
const verifyToken = (req, res, next) => {
    const auth = req.headers.authorization;
    const token = auth && auth.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Required token for authentication" });
    }

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = user; // Gán thông tin người dùng vào req.user
        next();
    });
};

// Middleware để xác thực quyền người dùng theo username
const verifyTokenAndUserAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.username === req.params.username || req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ message: "Not authorized" });
        }
    });   
};

// Middleware để xác thực quyền admin
const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ message: "Not authorized" });
        }
    });
};

// Middleware để xác thực giáo viên hoặc học sinh
const verifyTokenAndRole = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'teacher' || req.user.role === 'student') {
            next();
        } else {
            return res.status(403).json({ message: "Not authorized" });
        }
    });
};

module.exports = {
    verifyToken,
    verifyTokenAndUserAuthorization,
    verifyTokenAndAdmin,
    verifyTokenAndRole
};