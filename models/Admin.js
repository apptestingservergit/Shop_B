const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true // Không được trùng lặp
    },
    password: { 
        type: String, 
        required: true // Mật khẩu (sẽ được hash dạng mã hóa ở bài sau)
    },
    email: { 
        type: String, 
        required: true 
    }
}, { 
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Admin', adminSchema);