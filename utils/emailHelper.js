const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // Bắt buộc false đối với port 587
        auth: {
            user: process.env.EMAIL_USER, // Sẽ nhận giá trị b73caf001@smtp-brevo.com từ Render
            pass: process.env.EMAIL_PASS  // Sẽ nhận chuỗi SMTP Key dài từ Render
        }
    });

    const mailOptions = {
        from: `"YOUTH SHOP" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;