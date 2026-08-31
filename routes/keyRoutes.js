const express = require('express');
const router = express.Router();
const { verifyKey, getAllKeys, createKey, updateKeyStatus, deleteKey } = require('../controllers/keyController');
const { protect } = require('../middlewares/auth'); // Import ông bảo vệ Admin

// Public route (Khách hàng dùng để kiểm tra KEY lúc mới vào web)
router.post('/verify', verifyKey);

// Protected routes (Các đường dẫn này sẽ đi qua hàm protect trước, nếu hợp lệ mới được đi tiếp vào controller)
router.route('/')
    .get(protect, getAllKeys)    // Admin xem danh sách KEY
    .post(protect, createKey);   // Admin tạo KEY mới

router.route('/:id')
    .put(protect, updateKeyStatus) // Admin bật/tắt KEY
    .delete(protect, deleteKey);   // Admin xóa KEY

module.exports = router;