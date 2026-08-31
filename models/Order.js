const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderCode: { type: String, required: true, unique: true }, // Mã đơn (vd: YS-20260831-0001)
    
    // Thông tin khách mua
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String }, // Có thể để trống
    note: { type: String },
    
    // ---> THÊM TRƯỜNG LƯU KEY ĐĂNG NHẬP VÀO TRANG CỦA KHÁCH <---
    loginKeyUsed: { type: String, default: 'Không rõ' },

    // Danh sách sản phẩm mua (LƯU SNAPSHOT để giữ nguyên giá khi Admin đổi giá sau này)
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        productName: { type: String, required: true }, // Tên lúc mua
        price: { type: Number, required: true },      // Giá lúc mua
        quantity: { type: Number, required: true },    // Số lượng mua
        subtotal: { type: Number, required: true }     // Tổng tiền 1 món (giá x số lượng)
    }],
    
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true }, // Tổng cộng đơn hàng
    
    // Trạng thái tách biệt 'paid' (tính doanh thu) và 'completed' (giao xong) như bạn yêu cầu
    status: { 
        type: String, 
        enum: ['pending', 'payment_pending', 'processing', 'paid', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    
    // Cờ đánh dấu đã trừ tồn kho chưa (để tránh trừ đúp khi đổi trạng thái)
    isStockDeducted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);