const axios = require('axios');

const sendEmail = async ({ email, subject, html }) => {
    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: {
                    name: 'YOUTH SHOP',
                    email: process.env.EMAIL_USER
                },
                to: [
                    {
                        email
                    }
                ],
                subject,
                htmlContent: html
            },
            {
                headers: {
                    accept: 'application/json',
                    'api-key': process.env.EMAIL_PASS,
                    'content-type': 'application/json'
                },
                timeout: 15000
            }
        );

        console.log('[BREVO EMAIL] Gửi thành công:', response.data);

        return response.data;
    } catch (error) {
        console.error(
            '[BREVO EMAIL ERROR]:',
            error.response?.data || error.message
        );

        throw error;
    }
};

module.exports = sendEmail;