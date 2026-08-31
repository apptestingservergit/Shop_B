const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Cố gắng kết nối tới MongoDB thông qua URL trong file .env
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        console.log(`✅ Kết nối MongoDB thành công: ${conn.connection.host}`);
    } catch (error) {
        // Nếu kết nối thất bại, in ra lỗi và dừng chương trình
        console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;