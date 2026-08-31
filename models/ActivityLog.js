const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    adminUser: { type: String, required: true }, // Tên admin thực hiện
    action: { type: String, required: true },    // Hành động (Ví dụ: "Xác nhận đơn YS-001")
    ipAddress: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);