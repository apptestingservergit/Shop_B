const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Token thường được gửi qua header với định dạng: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Cắt chuỗi lấy phần token (bỏ chữ Bearer)
            token = req.headers.authorization.split(' ')[1];
            
            // Dùng chìa khóa trong .env để giải mã Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Gắn thông tin admin vừa giải mã vào request để các API phía sau dùng
            req.admin = decoded; 
            
            // Cho phép đi tiếp vào Controller
            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập, vui lòng đăng nhập' });
    }
};

module.exports = { protect };