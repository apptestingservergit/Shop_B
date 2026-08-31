const Key = require('../models/Key');

// @desc    Khách hàng nhập KEY ở trang chủ để kiểm tra
// @route   POST /api/keys/verify
// @access  Public
const verifyKey = async (req, res) => {
    try {
        const { key } = req.body;
        if (!key) return res.status(400).json({ success: false, message: 'Vui lòng nhập KEY' });

        const keyData = await Key.findOne({ key });
        if (!keyData) return res.status(404).json({ success: false, message: 'KEY không tồn tại' });
        if (keyData.status !== 'active') return res.status(403).json({ success: false, message: 'KEY đã bị vô hiệu hóa' });
        if (keyData.expiresAt && new Date() > keyData.expiresAt) return res.status(403).json({ success: false, message: 'KEY đã hết hạn' });

        res.status(200).json({ success: true, message: 'KEY hợp lệ, chào mừng bạn!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Lấy danh sách tất cả KEY
// @route   GET /api/keys
// @access  Private (Chỉ Admin)
const getAllKeys = async (req, res) => {
    try {
        const keys = await Key.find().sort('-createdAt');
        res.status(200).json({ success: true, data: keys });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Tạo KEY mới
// @route   POST /api/keys
// @access  Private (Chỉ Admin)
const createKey = async (req, res) => {
    try {
        const { key, expiresInHours } = req.body;
        
        // Tính toán ngày hết hạn
        let expiresAt = null;
        if (expiresInHours) {
            expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + parseInt(expiresInHours));
        }

        const newKey = await Key.create({ key, expiresAt });
        res.status(201).json({ success: true, message: 'Tạo KEY thành công', data: newKey });
    } catch (error) {
        // Bắt lỗi trùng KEY (mã lỗi 11000 của MongoDB)
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'KEY này đã tồn tại' });
        }
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Cập nhật trạng thái KEY (Bật/Tắt)
// @route   PUT /api/keys/:id
// @access  Private (Chỉ Admin)
const updateKeyStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updatedKey = await Key.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        if (!updatedKey) return res.status(404).json({ success: false, message: 'Không tìm thấy KEY' });
        res.status(200).json({ success: true, message: 'Cập nhật KEY thành công', data: updatedKey });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Xóa KEY
// @route   DELETE /api/keys/:id
// @access  Private (Chỉ Admin)
const deleteKey = async (req, res) => {
    try {
        const key = await Key.findByIdAndDelete(req.params.id);
        if (!key) return res.status(404).json({ success: false, message: 'Không tìm thấy KEY' });
        res.status(200).json({ success: true, message: 'Xóa KEY thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = { verifyKey, getAllKeys, createKey, updateKeyStatus, deleteKey };