const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController'); // Gọi controller vừa viết

// Khi có người gửi request POST tới /login, chạy hàm login ở controller
router.post('/login', login);

module.exports = router;