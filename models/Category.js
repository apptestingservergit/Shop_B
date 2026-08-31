const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    slug: { 
        type: String, 
        required: true, 
        unique: true // Tên dùng trên thanh địa chỉ URL (vd: ao-hoodie)
    },
    description: { 
        type: String 
    },
    status: { 
        type: String, 
        enum: ['active', 'hidden'], // Có thể ẩn danh mục đi mà không cần xóa
        default: 'active' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);