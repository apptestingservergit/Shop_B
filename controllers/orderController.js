const Order = require('../models/Order');
const Product = require('../models/Product');
const sendEmail = require('../utils/emailHelper');

// [USER] Tạo mã đơn hàng tự động
const generateOrderCode = async () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    const count = await Order.countDocuments({
        orderCode: new RegExp(`^YS-${dateStr}`)
    });

    const sequence = String(count + 1).padStart(5, '0');
    return `YS-${dateStr}-${sequence}`;
};

// [USER] Tạo đơn hàng mới
const createOrder = async (req, res) => {
    try {
        const { fullName, phone, email, address, note, items } = req.body;

        if (!fullName || !phone || !address) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
        }

        let verifiedProducts = [];
        let subtotal = 0;

        for (const item of items) {
            const product = await Product.findById(item.id);
            
            if (!product || product.isDeleted || product.status !== 'active') {
                return res.status(400).json({ 
                    success: false, 
                    message: `Sản phẩm "${item.name}" không còn tồn tại hoặc đã ngừng kinh doanh` 
                });
            }

            const realPrice = (product.promotionalPrice && product.promotionalPrice > 0) 
                ? product.promotionalPrice 
                : product.price;

            const itemSubtotal = realPrice * item.quantity;
            subtotal += itemSubtotal;

            verifiedProducts.push({
                productId: product._id,
                productName: product.name,
                price: realPrice,
                quantity: item.quantity,
                subtotal: itemSubtotal
            });
        }

        const shippingFee = 30000;
        const total = subtotal + shippingFee;
        const orderCode = await generateOrderCode();

        const newOrder = await Order.create({
            orderCode,
            fullName,
            phone,
            email,
            address,
            note,
            products: verifiedProducts,
            shippingFee,
            total,
            status: 'pending',
            isStockDeducted: false
        });

        // GỬI EMAIL THÔNG BÁO CHO ADMIN
        if (process.env.ADMIN_EMAIL && process.env.MAIL_USER) {
            try {
                const productListHtml = verifiedProducts.map(p => `<li>${p.productName} x ${p.quantity} - Giá: ${p.price.toLocaleString()} VNĐ</li>`).join('');
                
                await sendEmail({
                    email: process.env.ADMIN_EMAIL,
                    subject: `[YOUTH SHOP] Có đơn hàng mới - ${orderCode}`,
                    html: `
                        <h3>Có đơn hàng mới vừa được đặt!</h3>
                        <p><strong>Mã đơn:</strong> ${orderCode}</p>
                        <p><strong>Khách hàng:</strong> ${fullName}</p>
                        <p><strong>Điện thoại:</strong> ${phone}</p>
                        <p><strong>Địa chỉ:</strong> ${address}</p>
                        <p><strong>Sản phẩm:</strong></p>
                        <ul>${productListHtml}</ul>
                        <p><strong>Tổng tiền:</strong> ${total.toLocaleString()} VNĐ</p>
                    `
                });
            } catch (mailErr) {
                console.error("Lỗi gửi email thông báo đơn hàng:", mailErr);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công',
            data: { orderCode: newOrder.orderCode, total: newOrder.total }
        });

    } catch (error) {
        console.error('Lỗi tạo đơn hàng:', error);
        res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
    }
};

// [ADMIN] Lấy toàn bộ danh sách đơn hàng
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort('-createdAt');
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// [ADMIN] Xác nhận đơn hàng (Kiểm tra tồn kho & Trừ tồn kho)
const confirmOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        if (order.isStockDeducted) {
            return res.status(400).json({ success: false, message: 'Đơn hàng này đã được xác nhận và trừ tồn kho trước đó rồi' });
        }

        for (const item of order.products) {
            const product = await Product.findById(item.productId);
            if (!product || product.stockQuantity < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Sản phẩm "${item.productName}" không đủ tồn kho (Còn lại: ${product ? product.stockQuantity : 0})` 
                });
            }
        }

        for (const item of order.products) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { 
                    stockQuantity: -item.quantity, 
                    soldQuantity: item.quantity    
                }
            });
        }

        order.status = 'processing';
        order.isStockDeducted = true;
        await order.save();

        res.status(200).json({ success: true, message: 'Xác nhận đơn hàng thành công, đã cập nhật tồn kho!', data: order });

    } catch (error) {
        console.error('Lỗi xác nhận đơn:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// [ADMIN] Đánh dấu đơn hàng là Đã thanh toán (paid)
const markOrderAsPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        order.status = 'paid';
        await order.save();

        res.status(200).json({ success: true, message: 'Đã cập nhật đơn hàng thành Đã thanh toán!', data: order });
    } catch (error) {
        console.error('Lỗi cập nhật thanh toán:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// [ADMIN] Hủy đơn hàng
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn' });

        if (order.isStockDeducted) {
            for (const item of order.products) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { 
                        stockQuantity: item.quantity, 
                        soldQuantity: -item.quantity 
                    }
                });
            }
            order.isStockDeducted = false;
        }

        order.status = 'cancelled';
        await order.save();

        res.status(200).json({ success: true, message: 'Đã hủy đơn hàng thành công', data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = { createOrder, getAllOrders, confirmOrder, cancelOrder, markOrderAsPaid };