const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 465,
        secure: true, // Bắt buộc true đối với cổng 465
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // Lúc này dùng lại chuỗi xsmtpsib-... bình thường
        }
    });

    const mailOptions = {
        from: `"YOUTH SHOP" <lek08670@gmail.com>`,
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;