const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect } = require('../middlewares/auth'); 

// Public (Khách truy cập để hiển thị menu Danh mục)
router.get('/', getCategories);

// Private (Chỉ Admin có token mới được thêm, sửa, xóa)
router.post('/', protect, createCategory);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);

module.exports = router;