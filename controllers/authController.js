const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Admin đăng nhập
// @route   POST /api/admin/login
// @access  Public
const login = async (req, res) => {
    try {
        // Lấy username và password từ frontend gửi lên (req.body)
        const { username, password } = req.body;

        // 1. Tìm Admin trong Database xem có tồn tại không
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
        }

        // 2. Nếu có, đem so sánh mật khẩu người dùng nhập với mật khẩu mã hóa trong DB
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
        }

        // 3. Nếu đúng, tạo Token (Giống thẻ nhân viên)
        // Ký token bằng chữ ký bí mật trong file .env, hạn dùng 1 ngày
        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } 
        );

        // 4. Trả kết quả về cho Frontend
        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                token: token,
                admin: {
                    id: admin._id,
                    username: admin.username,
                    email: admin.email
                }
            }
        });

    } catch (error) {
        console.error('Lỗi login:', error);
        res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
    }
};

module.exports = { login };