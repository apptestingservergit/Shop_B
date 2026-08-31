const express = require('express');
const router = express.Router();
const { getProducts, getAdminProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middlewares/auth');

// Private (Admin) - Phải đặt trên /:slug để Express không hiểu lầm chữ "admin" là 1 slug sản phẩm
router.get('/admin/all', protect, getAdminProducts);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

// Public (Khách hàng)
router.get('/', getProducts);
router.get('/:slug', getProductBySlug); 

module.exports = router;