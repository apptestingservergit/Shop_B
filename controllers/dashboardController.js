const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Lấy số liệu thống kê và biểu đồ cho Dashboard Admin
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
    try {
        const { timeframe = '30days' } = req.query;

        // 1. Các thống kê tổng quan toàn hệ thống (Cards)
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

        // 2. Tính toán khoảng thời gian (Timeframe) và so sánh kỳ trước để lấy % tăng trưởng
        let now = new Date();
        let dateLimit = new Date();
        let previousDateLimit = new Date();
        let durationMs = 0;

        if (timeframe === '7days') {
            durationMs = 7 * 24 * 60 * 60 * 1000;
        } else if (timeframe === '30days') {
            durationMs = 30 * 24 * 60 * 60 * 1000;
        } else if (timeframe === '3months') {
            durationMs = 90 * 24 * 60 * 60 * 1000;
        } else if (timeframe === '1year') {
            durationMs = 365 * 24 * 60 * 60 * 1000;
        } else {
            durationMs = null; // Toàn bộ thời gian
        }

        let revenueGrowth = 0;
        let orderGrowth = 0;

        if (durationMs !== null) {
            dateLimit = new Date(now.getTime() - durationMs);
            previousDateLimit = new Date(dateLimit.getTime() - durationMs);

            // Doanh thu kỳ hiện tại vs kỳ trước
            const currentRevenueAgg = await Order.aggregate([
                { $match: { status: 'paid', createdAt: { $gte: dateLimit } } },
                { $group: { _id: null, sum: { $sum: '$total' } } }
            ]);
            const currentRev = currentRevenueAgg.length > 0 ? currentRevenueAgg[0].sum : 0;

            const prevRevenueAgg = await Order.aggregate([
                { $match: { status: 'paid', createdAt: { $gte: previousDateLimit, $lt: dateLimit } } },
                { $group: { _id: null, sum: { $sum: '$total' } } }
            ]);
            const prevRev = prevRevenueAgg.length > 0 ? prevRevenueAgg[0].sum : 0;

            if (prevRev > 0) {
                revenueGrowth = Number(((currentRev - prevRev) / prevRev * 100).toFixed(1));
            } else {
                revenueGrowth = currentRev > 0 ? 100 : 0;
            }

            // Đơn hàng kỳ hiện tại vs kỳ trước
            const currentOrderCount = await Order.countDocuments({ createdAt: { $gte: dateLimit } });
            const prevOrderCount = await Order.countDocuments({ createdAt: { $gte: previousDateLimit, $lt: dateLimit } });

            if (prevOrderCount > 0) {
                orderGrowth = Number(((currentOrderCount - prevOrderCount) / prevOrderCount * 100).toFixed(1));
            } else {
                orderGrowth = currentOrderCount > 0 ? 100 : 0;
            }
        } else {
            dateLimit = new Date(0); // All time
        }

        // 3. Gom nhóm dữ liệu biểu đồ
        const revenueChartData = await Order.aggregate([
            { $match: { status: 'paid', createdAt: { $gte: dateLimit } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    dailyRevenue: { $sum: "$total" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const orderChartData = await Order.aggregate([
            { $match: { createdAt: { $gte: dateLimit } } },
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
                revenueGrowth, // Trả về % tăng trưởng doanh thu thực tế
                orderGrowth,   // Trả về % tăng trưởng đơn hàng thực tế
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