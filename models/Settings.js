const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    websiteName: { type: String, default: 'YOUTH SHOP' },
    logoUrl: { type: String, default: '' },
    adminEmail: { type: String },
    phone: { type: String },
    address: { type: String },
    defaultShippingFee: { type: Number, default: 30000 },
    emailNotification: { type: Boolean, default: true },
    itemsPerPage: { type: Number, default: 12 }
}, { timestamps: true });

// Luôn đảm bảo chỉ có 1 record Setting trong Database
module.exports = mongoose.model('Settings', settingsSchema);