const Category = require('../models/Category');

// Hàm hỗ trợ tạo slug tự động từ tên (Ví dụ: "Áo Hoodie" -> "ao-hoodie")
const generateSlug = (text) => {
    return text.toString().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
        .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
        .replace(/[^\w\-]+/g, '') // Xóa các ký tự đặc biệt
        .replace(/\-\-+/g, '-') // Xóa nhiều dấu gạch ngang liên tiếp
        .replace(/^-+/, '').replace(/-+$/, ''); // Xóa gạch ngang ở đầu và cuối
};

// @desc    Lấy tất cả danh mục
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Tạo danh mục mới
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        let { slug } = req.body;

        if (!name) return res.status(400).json({ success: false, message: 'Tên danh mục là bắt buộc' });
        
        // Nếu không truyền slug, tự động tạo từ name
        if (!slug) slug = generateSlug(name);

        const category = await Category.create({ name, slug, description, status });
        res.status(201).json({ success: true, message: 'Tạo danh mục thành công', data: category });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Slug hoặc Tên danh mục đã tồn tại' });
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Cập nhật danh mục
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        res.status(200).json({ success: true, message: 'Cập nhật thành công', data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Xóa danh mục
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        res.status(200).json({ success: true, message: 'Xóa danh mục thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };