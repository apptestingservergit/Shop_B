const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // Bắt buộc false đối với port 587
        auth: {
            user: process.env.EMAIL_USER, // Vẫn giữ nguyên tài khoản Login Brevo (b73caf001@smtp-brevo.com)
            pass: process.env.EMAIL_PASS  // Vẫn giữ nguyên SMTP Key từ Render
        }
    });

    const mailOptions = {
        // BẮT BUỘC ĐỂ EMAIL BẠN VỪA VERIFY TRÊN BREVO Ở ĐÂY ĐỂ TRÁNH BỊ CHẶN
        from: `"YOUTH SHOP" <lek08670@gmail.com>`,
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;