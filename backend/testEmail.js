// testEmail.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.sendMail({
  from: process.env.SMTP_USER,
  to: process.env.SMTP_USER,
  subject: 'Test Email',
  text: 'Hello from Lifesync+ test!',
}, (err, info) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Sent:', info.response);
  }
});