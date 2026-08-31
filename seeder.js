require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Import các Models chúng ta vừa tạo
const Admin = require('./models/Admin');
const Key = require('./models/Key');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Settings = require('./models/Settings');

connectDB();

const importData = async () => {
    try {
        // 1. Xóa toàn bộ dữ liệu cũ (để tránh lỗi trùng lặp khi chạy file này nhiều lần)
        await Admin.deleteMany();
        await Key.deleteMany();
        await Category.deleteMany();
        await Product.deleteMany();
        await Settings.deleteMany();

        // 2. Mã hóa mật khẩu Admin (Hash password)
        const salt = await bcrypt.genSalt(10); // Tạo chuỗi ngẫu nhiên (độ khó 10)
        const hashedPassword = await bcrypt.hash('123456', salt); // Trộn và băm mật khẩu '123456'

        // 3. Tạo Admin vào DB
        await Admin.create({
            username: 'admin',
            password: hashedPassword,
            email: 'admin@youthshop.com'
        });

        // 4. Tạo KEY mặc định
        await Key.create({
            key: 'YOUTHSHOP2026',
            status: 'active'
        });

        // 5. Tạo Cấu hình mặc định
        await Settings.create({
            websiteName: 'YOUTH SHOP',
            adminEmail: 'admin@youthshop.com'
        });

        // 6. Tạo 1 Danh mục và 1 Sản phẩm mẫu
        const category = await Category.create({
            name: 'Áo Hoodie',
            slug: 'ao-hoodie',
            description: 'Áo Hoodie dành cho giới trẻ'
        });

        await Product.create({
            name: 'Hoodie Youth Black',
            slug: 'hoodie-youth-black',
            category: category._id, // Gắn ID của category vừa tạo vào đây
            price: 350000,
            stockQuantity: 100,
            images: ['https://via.placeholder.com/400'], // Ảnh tạm thời
            shortDescription: 'Áo màu đen cá tính.'
        });

        console.log('✅ Dữ liệu mẫu đã được BƠM vào Database thành công!');
        process.exit(); // Tự động thoát Script
    } catch (error) {
        console.error(`❌ Lỗi tạo dữ liệu: ${error.message}`);
        process.exit(1);
    }
};

importData();