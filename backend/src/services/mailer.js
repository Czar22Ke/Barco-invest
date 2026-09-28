const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525', 10),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const sendEmail = async (to, subject, htmlContent) => {
  if (!to) {
    console.warn('sendEmail: No recipient email address provided.');
    return false;
  }
  try {
    const info = await transporter.sendMail({
      from: `"Investment Platform" <${process.env.FROM_EMAIL || 'support@investmentplatform.com'}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message || error);
    return false;
  }
};

module.exports = { sendEmail, transporter };
module.exports.default = { sendEmail, transporter };
module.exports.sendEmail = sendEmail;
module.exports.transporter = transporter;
