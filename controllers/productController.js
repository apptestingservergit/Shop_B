const Product = require('../models/Product');

// Hàm tạo slug tự động
const generateSlug = (text) => {
    return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
};

// @desc    Khách hàng xem sản phẩm (Chỉ thấy sp đang active và chưa bị xóa)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ status: 'active', isDeleted: false })
                                      .populate('category', 'name slug') // Lấy thêm tên danh mục thay vì chỉ lấy ID
                                      .sort('-createdAt'); // Mới nhất lên đầu
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Admin xem toàn bộ sản phẩm (Kể cả ẩn, nhưng không tính SP đã bị soft delete)
// @route   GET /api/products/admin/all
// @access  Private (Admin)
const getAdminProducts = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: false }).populate('category', 'name').sort('-createdAt');
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Xem chi tiết 1 sản phẩm theo Slug (Cho trang chi tiết sp)
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isDeleted: false }).populate('category', 'name');
        if (!product) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Private (Admin)
const createProduct = async (req, res) => {
    try {
        // Validation cơ bản từ backend (không bao giờ tin frontend)
        if (req.body.price < 0 || req.body.stockQuantity < 0) {
            return res.status(400).json({ success: false, message: 'Giá và số lượng không được âm' });
        }

        let { slug, name } = req.body;
        if (!slug) req.body.slug = generateSlug(name);

        const product = await Product.create(req.body);
        res.status(201).json({ success: true, message: 'Tạo sản phẩm thành công', data: product });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Tên hoặc Slug sản phẩm đã bị trùng' });
        res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
};

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Private (Admin)
const updateProduct = async (req, res) => {
    try {
        if (req.body.price < 0 || req.body.stockQuantity < 0) {
            return res.status(400).json({ success: false, message: 'Giá và số lượng không được âm' });
        }

        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        res.status(200).json({ success: true, message: 'Cập nhật thành công', data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Xóa mềm sản phẩm (Soft Delete)
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res) => {
    try {
        // Thay vì xóa hẳn, ta chỉ cập nhật isDeleted thành true
        const product = await Product.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        
        if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        res.status(200).json({ success: true, message: 'Đã xóa sản phẩm (Xóa mềm)' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = { getProducts, getAdminProducts, getProductBySlug, createProduct, updateProduct, deleteProduct };