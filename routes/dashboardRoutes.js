const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/auth'); // Bảo vệ API chỉ dành cho Admin đã đăng nhập

// Lấy thông số thống kê (Yêu cầu có token Admin)
router.get('/', protect, getDashboardStats);

module.exports = router;