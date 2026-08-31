const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Tạo transporter sử dụng dịch vụ SMTP của Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER, // Email của bạn (đặt trong .env)
            pass: process.env.MAIL_PASS  // Mật khẩu ứng dụng App Password (đặt trong .env)
        }
    });

    // 2. Cấu hình nội dung email
    const mailOptions = {
        from: `"YOUTH SHOP" <${process.env.MAIL_USER}>`,
        to: options.email, // Email người nhận (Admin hoặc khách hàng)
        subject: options.subject,
        html: options.html
    };

    // 3. Tiến hành gửi mail
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;