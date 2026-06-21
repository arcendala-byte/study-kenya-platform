const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// Email configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Send email notifications
async function sendEmailNotifications(name, email, message) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@studykenya.com';

    try {
        // Email to admin
        await transporter.sendMail({
            from: `"Study Kenya Platform" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `📬 New Contact Form Submission from ${name}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a5f7a; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 5px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #1a5f7a; }
            .value { margin-top: 5px; padding: 10px; background: white; border-radius: 3px; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">👤 Name:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">📧 Email:</div>
                <div class="value">${email}</div>
              </div>
              <div class="field">
                <div class="label">💬 Message:</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <p>You can reply directly to ${email} to respond to this inquiry.</p>
            </div>
          </div>
        </body>
        </html>
      `,
        });

        // Auto-reply to user
        await transporter.sendMail({
            from: `"Study Kenya Platform" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Thank you for contacting Study Kenya Platform",
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a5f7a; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .message-box { background: #f9f9f9; padding: 15px; border-left: 3px solid #1a5f7a; margin: 15px 0; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Thank You for Reaching Out!</h2>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Thank you for contacting <strong>Study Kenya Platform</strong>. We have received your message and our team will get back to you within 24 hours.</p>
              <p>Here's a copy of your message:</p>
              <div class="message-box">
                "${message}"
              </div>
              <p>In the meantime, feel free to:</p>
              <ul>
                <li>Browse our <a href="https://studykenya.com/universities">university listings</a></li>
                <li>Read our <a href="https://studykenya.com/blog">blog articles</a> about studying in Kenya</li>
              </ul>
              <p>Best regards,<br>
              <strong>Study Kenya Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 Study Kenya Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
        });

        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        throw error;
    }
}

// POST /api/contact
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                error: 'All fields are required: name, email, and message'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Save to Supabase
        const { data, error: dbError } = await supabase
            .from('inquiries')
            .insert([
                {
                    name,
                    email,
                    message,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (dbError) {
            console.error('Database error:', dbError);
            // Continue to send email even if DB save fails
        }

        // Send email notifications
        await sendEmailNotifications(name, email, message);

        res.status(200).json({
            success: true,
            message: 'Message sent successfully. We will respond within 24 hours.'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            error: 'Failed to send message. Please try again later.'
        });
    }
});

module.exports = router;