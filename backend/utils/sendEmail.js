const sendEmail = async (options) => {
  // In a production app, you would configure Nodemailer, SendGrid, etc. here.
  // Since we are running in an environment without SMTP, we simulate email sending
  // by outputting the password reset link directly to the console.
  
  console.log('===================================================');
  console.log(`[SIMULATED EMAIL TO: ${options.email}]`);
  console.log(`Subject: ${options.subject}`);
  console.log(`\nMessage:\n${options.message}`);
  console.log('===================================================');
};

module.exports = sendEmail;
