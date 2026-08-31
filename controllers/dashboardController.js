const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Lấy số liệu thống kê và biểu đồ cho Dashboard Admin
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
    try {
        const { timeframe = '30days' } = req.query; // Mặc định lọc 30 ngày

        // 1. Các thống kê tổng quan (Cards)
        const totalProducts = await Product.countDocuments({ isDeleted: false });
        const lowStockProducts = await Product.countDocuments({ isDeleted: false, stockQuantity: { $lte: 5 } });

        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const processingOrders = await Order.countDocuments({ status: 'processing' });
        const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

        const revenueResult = await Order.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        const productsSoldResult = await Product.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: null, totalSold: { $sum: '$soldQuantity' } } }
        ]);
        const totalSoldProducts = productsSoldResult.length > 0 ? productsSoldResult[0].totalSold : 0;

        // 2. Xử lý dữ liệu cho BIỂU ĐỒ (Chart Data) theo khoảng thời gian (timeframe)
        let dateLimit = new Date();
        if (timeframe === '7days') {
            dateLimit.setDate(dateLimit.getDate() - 7);
        } else if (timeframe === '30days') {
            dateLimit.setDate(dateLimit.getDate() - 30);
        } else if (timeframe === '3months') {
            dateLimit.setMonth(dateLimit.getMonth() - 3);
        } else if (timeframe === '1year') {
            dateLimit.setFullYear(dateLimit.getFullYear() - 1);
        } else {
            dateLimit = new Date(0); // Lấy từ ngày bắt đầu (All time)
        }

        // Gom nhóm doanh thu đơn 'paid' theo từng ngày
        const revenueChartData = await Order.aggregate([
            { 
                $match: { 
                    status: 'paid', 
                    createdAt: { $gte: dateLimit } 
                } 
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    dailyRevenue: { $sum: "$total" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } } // Sắp xếp theo ngày tăng dần
        ]);

        // Gom nhóm tổng đơn hàng theo ngày (Bao gồm mọi trạng thái để thấy lưu lượng khách)
        const orderChartData = await Order.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: dateLimit } 
                } 
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalOrdersDaily: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                totalOrders,
                pendingOrders,
                processingOrders,
                cancelledOrders,
                totalProducts,
                lowStockProducts,
                totalSoldProducts,
                revenueChartData,
                orderChartData
            }
        });

    } catch (error) {
        console.error('Lỗi lấy thống kê dashboard:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu thống kê' });
    }
};

module.exports = { getDashboardStats };