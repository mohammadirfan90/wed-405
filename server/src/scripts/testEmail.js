require('dotenv').config();
const { sendEmail } = require('../utils/email');

async function test() {
  console.log('Using config:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '********' : 'undefined');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  
  await sendEmail({
    to: process.env.SMTP_USER, // send to yourself
    subject: 'Test Email from BiyeBuzz',
    html: '<h1>If you receive this, SMTP is working perfectly!</h1>',
  });
}

test();
