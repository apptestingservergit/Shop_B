const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
    key: { 
        type: String, 
        required: true, 
        unique: true 
    },
    status: { 
        type: String, 
        enum: ['active', 'inactive'], // Chỉ cho phép 2 trạng thái này
        default: 'active' 
    },
    expiresAt: { 
        type: Date, // Thời hạn của Key (Nếu null nghĩa là vĩnh viễn)
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Key', keySchema);