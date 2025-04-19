const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html, qrCodeImage) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Prepare attachments array only if QR code is provided
  const attachments = [];
  if (qrCodeImage) {
    // Remove data URL prefix
    const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, '');
    attachments.push({
      filename: 'qr-code.png',
      content: base64Data,
      encoding: 'base64',
      cid: 'qr-code-image'
    });
  }

  // Mail options
  const mailOptions = {
    from: `"Team Fleep" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    attachments
  };

  // Send mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
