const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/contact/export - Handle export inquiry form
router.post('/export', async (req, res) => {
  try {
    const { name, email, phone, company, country, product, quantity, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !country || !product || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Create email transporter
    // Note: For production, use environment variables for email credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'yogemca@gmail.com',
        pass: process.env.EMAIL_PASSWORD // App-specific password required
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'yogemca@gmail.com',
      to: 'yogemca@gmail.com',
      subject: `Export Inquiry from ${name} - ${country}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d35400; border-bottom: 3px solid #e67e22; padding-bottom: 10px;">
            New Export Inquiry - Coorg Masala
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> ${phone}</p>
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
            <p><strong>Country:</strong> ${country}</p>
          </div>

          <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Product Details</h3>
            <p><strong>Product Interest:</strong> ${product}</p>
            ${quantity ? `<p><strong>Estimated Quantity:</strong> ${quantity}</p>` : ''}
          </div>

          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Message</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This inquiry was submitted through the Coorg Masala Export page.</p>
            <p>Received on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
      text: `
Export Inquiry - Coorg Masala

Contact Information:
Name: ${name}
Email: ${email}
Phone: ${phone}
${company ? `Company: ${company}` : ''}
Country: ${country}

Product Details:
Product Interest: ${product}
${quantity ? `Estimated Quantity: ${quantity}` : ''}

Message:
${message}

Received on: ${new Date().toLocaleString()}
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Your inquiry has been sent successfully. We will contact you soon!'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    // Check if it's an authentication error
    if (error.code === 'EAUTH') {
      return res.status(500).json({
        success: false,
        message: 'Email service configuration error. Please contact support directly at yogemca@gmail.com'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to send inquiry. Please try again or contact us directly at yogemca@gmail.com'
    });
  }
});

module.exports = router;
