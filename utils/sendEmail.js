const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create the Transporter (The Postman)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS  // Your App Password
        }
    });

    // 2. Define the Email Options
    const mailOptions = {
        from: `"Gadget Store Support" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        // Optional: Add HTML if you want it to look pretty
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>You requested a password reset. Click the link below to set a new password:</p>
                <a href="${options.url}" style="background: #6366F1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p style="margin-top: 20px; color: gray;">If you didn't request this, please ignore this email.</p>
            </div>
        `
    };

    // 3. Send the Email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;