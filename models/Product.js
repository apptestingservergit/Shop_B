const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    // Liên kết với bảng Category (Tham chiếu ID)
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    
    price: { type: Number, required: true, min: 0 }, // Giá gốc (không được âm)
    promotionalPrice: { type: Number, default: 0, min: 0 }, // Giá khuyến mãi
    
    stockQuantity: { type: Number, required: true, min: 0 }, // Tồn kho thực tế
    soldQuantity: { type: Number, default: 0 }, // Số lượng đã bán
    
    images: [{ type: String }], // Mảng chứa các đường dẫn ảnh
    
    shortDescription: { type: String },
    detailedDescription: { type: String },
    
    // Các cờ (flag) để hiển thị ở các khu vực đặc biệt trên web
    isFeatured: { type: Boolean, default: false }, // Nổi bật
    isNewProduct: { type: Boolean, default: false }, // Sản phẩm mới
    
    status: { type: String, enum: ['active', 'hidden'], default: 'active' },
    
    // SOFT DELETE: Xóa mềm, không xóa dữ liệu thật khỏi DB để bảo toàn lịch sử đơn hàng
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);