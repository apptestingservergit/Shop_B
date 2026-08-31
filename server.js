// 1. Nhập các thư viện cần thiết
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config(); // Đọc biến môi trường từ file .env
const connectDB = require('./config/db'); // Import hàm kết nối DB

// 2. Import Routes
const authRoutes = require('./routes/authRoutes');
const keyRoutes = require('./routes/keyRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// 3. Khởi tạo app Express & Kết nối Database
const app = express();
connectDB(); 

// 4. Cài đặt Middlewares (Phần mềm trung gian)
// Tạm tắt chặn CDN (Content Security Policy) để dùng được Bootstrap và SweetAlert2 ở Frontend
app.use(helmet({
    contentSecurityPolicy: false,
})); 
// Log các request ra console để dễ debug
app.use(morgan('dev')); 
// Cho phép gọi API từ tên miền khác (CORS)
app.use(cors()); 
// Giúp Backend đọc được dữ liệu dạng JSON
app.use(express.json()); 
// Giúp Backend đọc được dữ liệu từ Form
app.use(express.urlencoded({ extended: true })); 

// 5. Cấu hình phục vụ file tĩnh (Frontend)
// Express sẽ tự động tìm các file html, css, js trong thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

// 6. Định nghĩa các Routes API 
app.use('/api/admin', authRoutes); 
app.use('/api/keys', keyRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);

// Route test server
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: "Chào mừng đến với Backend YOUTH SHOP!",
        timestamp: new Date()
    });
});

// 7. Xử lý lỗi API không tồn tại (404)
// Bắt mọi route bắt đầu bằng /api mà không khớp với các route ở trên
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: "API không tồn tại!"
    });
});

// 8. Chạy Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================`);
    console.log(`🚀 Server đang chạy tại cổng: ${PORT}`);
    console.log(`🌐 Truy cập: http://localhost:${PORT}`);
    console.log(`=================================`);
});