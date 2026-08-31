const Key = require('../models/Key');

const checkKey = async (req, res, next) => {
    try {
        // Ưu tiên lấy KEY từ Header (x-api-key)
        const providedKey = req.headers['x-api-key'];

        if (!providedKey) {
            return res.status(401).json({ success: false, message: 'Truy cập bị từ chối: Vui lòng nhập KEY' });
        }

        // Tìm KEY trong Database
        const keyData = await Key.findOne({ key: providedKey });

        if (!keyData) {
            return res.status(401).json({ success: false, message: 'KEY không tồn tại' });
        }

        // Kiểm tra trạng thái
        if (keyData.status !== 'active') {
            return res.status(403).json({ success: false, message: 'KEY đã bị vô hiệu hóa bởi Admin' });
        }

        // Kiểm tra hạn sử dụng (nếu có)
        if (keyData.expiresAt && new Date() > keyData.expiresAt) {
            return res.status(403).json({ success: false, message: 'KEY đã hết hạn sử dụng' });
        }

        next(); // KEY hợp lệ, cho phép đi tiếp
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi server khi kiểm tra KEY' });
    }
};

module.exports = { checkKey };