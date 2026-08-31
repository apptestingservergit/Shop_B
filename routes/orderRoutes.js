const express = require('express');
const router = express.Router();
// Bổ sung thêm markOrderAsPaid vào danh sách import từ orderController ở đây:
const { createOrder, getAllOrders, confirmOrder, cancelOrder, markOrderAsPaid } = require('../controllers/orderController');
const { checkKey } = require('../middlewares/checkKey');
const { protect } = require('../middlewares/auth'); // Ông bảo vệ Admin

// Khách hàng đặt đơn
router.post('/', checkKey, createOrder);

// Quản trị viên quản lý đơn hàng
router.get('/admin/all', protect, getAllOrders);
router.put('/admin/:id/confirm', protect, confirmOrder);
router.put('/admin/:id/cancel', protect, cancelOrder);
router.put('/admin/:id/pay', protect, markOrderAsPaid);

module.exports = router;