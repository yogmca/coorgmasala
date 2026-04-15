const nodemailer = require('nodemailer');

// Create reusable transporter using GoDaddy SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'support@coorgmasala.com',
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send order confirmation email to the customer
 * with order details and tracking link.
 * BCC to admin email.
 */
const sendOrderConfirmationEmail = async (order) => {
  try {
    const transporter = createTransporter();

    const frontendUrl = process.env.FRONTEND_URL || 'https://coorgmasala.com';
    const trackingLink = `${frontendUrl}/order/${order.orderId}`;
    const adminBcc = process.env.ADMIN_BCC_EMAIL || 'ykmysuru27@gmail.com';

    // Build items table rows
    const itemRows = order.items.map((item, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#fafafa'};">
        <td style="padding: 14px 20px; border-bottom: 1px solid #e8e8e8; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #2c3e50;">
          ${item.name}
        </td>
        <td style="padding: 14px 20px; border-bottom: 1px solid #e8e8e8; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #2c3e50; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 14px 20px; border-bottom: 1px solid #e8e8e8; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #2c3e50; text-align: right;">
          ₹${item.price.toFixed(2)}
        </td>
        <td style="padding: 14px 20px; border-bottom: 1px solid #e8e8e8; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #2c3e50; text-align: right; font-weight: 600;">
          ₹${item.subtotal.toFixed(2)}
        </td>
      </tr>
    `).join('');

    const shippingAddr = order.shippingAddress;
    const addressStr = `${shippingAddr.street}, ${shippingAddr.city}, ${shippingAddr.state} - ${shippingAddr.pincode}, ${shippingAddr.country}`;

    const paymentMethod = order.paymentInfo.method
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Coorg Masala</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f2f5; -webkit-font-smoothing: antialiased;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f0f2f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <!-- Main Container -->
            <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 640px; width: 100%;">
              
              <!-- Top Accent Bar -->
              <tr>
                <td style="height: 4px; background: linear-gradient(90deg, #1a472a 0%, #2d7a3a 50%, #4a9e5c 100%);"></td>
              </tr>

              <!-- Header -->
              <tr>
                <td style="padding: 36px 48px 28px; text-align: center; background-color: #ffffff;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td align="center">
                        <h1 style="color: #1a472a; margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 32px; font-weight: 700; letter-spacing: 0.5px;">
                          Coorg Masala
                        </h1>
                        <p style="color: #7a8a7e; margin: 6px 0 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">
                          Premium Indian Spices
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding: 0 48px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr><td style="border-bottom: 1px solid #e8ece9;"></td></tr>
                  </table>
                </td>
              </tr>

              <!-- Order Confirmation Message -->
              <tr>
                <td style="padding: 32px 48px 24px; text-align: center;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td align="center">
                        <div style="width: 64px; height: 64px; background-color: #e8f5e9; border-radius: 50%; display: inline-block; line-height: 64px; margin-bottom: 16px;">
                          <span style="font-size: 28px; line-height: 64px;">✓</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <h2 style="color: #1a472a; margin: 0 0 8px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 24px; font-weight: 600;">
                          Order Confirmed
                        </h2>
                        <p style="color: #5a6b5e; margin: 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px; line-height: 1.5;">
                          Dear ${order.customerInfo.name}, thank you for your purchase.<br>
                          We're preparing your order and will notify you once it ships.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Order Summary Card -->
              <tr>
                <td style="padding: 0 48px 28px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8faf8; border: 1px solid #e2e8e3; border-radius: 8px; overflow: hidden;">
                    <tr>
                      <td style="padding: 18px 24px; border-bottom: 1px solid #e2e8e3;">
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #7a8a7e; text-transform: uppercase; letter-spacing: 1px;">
                              Order Number
                            </td>
                            <td style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #7a8a7e; text-align: right; text-transform: uppercase; letter-spacing: 1px;">
                              Order Date
                            </td>
                          </tr>
                          <tr>
                            <td style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; color: #1a472a; font-weight: 700; padding-top: 4px;">
                              ${order.orderId}
                            </td>
                            <td style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #2c3e50; text-align: right; padding-top: 4px;">
                              ${orderDate}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 18px 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #7a8a7e; text-transform: uppercase; letter-spacing: 1px;">
                              Payment Method
                            </td>
                            <td style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #7a8a7e; text-align: right; text-transform: uppercase; letter-spacing: 1px;">
                              Payment Status
                            </td>
                          </tr>
                          <tr>
                            <td style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #2c3e50; padding-top: 4px;">
                              ${paymentMethod}
                            </td>
                            <td style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; text-align: right; padding-top: 4px;">
                              <span style="background-color: #e8f5e9; color: #1a472a; padding: 3px 12px; border-radius: 12px; font-weight: 600; font-size: 12px;">
                                PAID
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    ${order.paymentInfo.transactionId ? `
                    <tr>
                      <td style="padding: 0 24px 18px;">
                        <p style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #999; margin: 0;">
                          Transaction ID: ${order.paymentInfo.transactionId}
                        </p>
                      </td>
                    </tr>
                    ` : ''}
                  </table>
                </td>
              </tr>

              <!-- Items Table -->
              <tr>
                <td style="padding: 0 48px 28px;">
                  <h3 style="color: #1a472a; font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px; margin: 0 0 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    Items Ordered
                  </h3>
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border: 1px solid #e2e8e3; border-radius: 8px; overflow: hidden;">
                    <tr style="background-color: #1a472a;">
                      <th style="padding: 12px 20px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #ffffff; text-align: left; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Product</th>
                      <th style="padding: 12px 20px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #ffffff; text-align: center; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Qty</th>
                      <th style="padding: 12px 20px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #ffffff; text-align: right; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Price</th>
                      <th style="padding: 12px 20px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #ffffff; text-align: right; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Subtotal</th>
                    </tr>
                    ${itemRows}
                    <tr style="background-color: #f8faf8;">
                      <td colspan="3" style="padding: 16px 20px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; color: #1a472a; text-align: right; font-weight: 700; border-top: 2px solid #1a472a;">
                        Total Amount
                      </td>
                      <td style="padding: 16px 20px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; color: #1a472a; text-align: right; font-weight: 700; border-top: 2px solid #1a472a;">
                        ₹${order.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Shipping Address -->
              <tr>
                <td style="padding: 0 48px 28px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8faf8; border: 1px solid #e2e8e3; border-radius: 8px;">
                    <tr>
                      <td style="padding: 20px 24px;">
                        <h3 style="color: #1a472a; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; margin: 0 0 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                          Delivery Address
                        </h3>
                        <p style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #2c3e50; line-height: 1.7; margin: 0;">
                          <strong>${order.customerInfo.name}</strong><br>
                          ${shippingAddr.street}<br>
                          ${shippingAddr.city}, ${shippingAddr.state} - ${shippingAddr.pincode}<br>
                          ${shippingAddr.country}<br>
                          <span style="color: #7a8a7e;">Phone:</span> ${order.customerInfo.phone}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Track Order CTA -->
              <tr>
                <td style="padding: 8px 48px 36px; text-align: center;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td align="center">
                        <p style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #5a6b5e; margin: 0 0 20px;">
                          You can track your order status anytime using the link below.
                        </p>
                        <!--[if mso]>
                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${trackingLink}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="10%" strokecolor="#1a472a" fillcolor="#1a472a">
                          <w:anchorlock/>
                          <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Track Your Order</center>
                        </v:roundrect>
                        <![endif]-->
                        <!--[if !mso]><!-->
                        <a href="${trackingLink}" target="_blank" style="display: inline-block; background-color: #1a472a; color: #ffffff; text-decoration: none; padding: 14px 48px; border-radius: 6px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px; font-weight: 600; letter-spacing: 0.5px; transition: background-color 0.2s;">
                          Track Your Order
                        </a>
                        <!--<![endif]-->
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 14px;">
                        <p style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #aaa; margin: 0;">
                          <a href="${trackingLink}" style="color: #7a8a7e; text-decoration: underline;">${trackingLink}</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding: 0 48px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr><td style="border-bottom: 1px solid #e8ece9;"></td></tr>
                  </table>
                </td>
              </tr>

              <!-- Help Section -->
              <tr>
                <td style="padding: 28px 48px; text-align: center;">
                  <p style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #5a6b5e; margin: 0 0 4px; line-height: 1.6;">
                    Need help with your order?
                  </p>
                  <p style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #5a6b5e; margin: 0;">
                    Contact us at <a href="mailto:support@coorgmasala.com" style="color: #1a472a; font-weight: 600; text-decoration: none;">support@coorgmasala.com</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8faf8; padding: 24px 48px; border-top: 1px solid #e8ece9;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td align="center">
                        <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px; color: #1a472a; margin: 0 0 4px; font-weight: 700;">
                          Coorg Masala
                        </p>
                        <p style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #aaa; margin: 0 0 8px; letter-spacing: 1px; text-transform: uppercase;">
                          Authentic Spices · Handpicked Quality · Farm to Kitchen
                        </p>
                        <p style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #bbb; margin: 0;">
                          &copy; ${new Date().getFullYear()} Coorg Masala. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Bottom Accent Bar -->
              <tr>
                <td style="height: 4px; background: linear-gradient(90deg, #1a472a 0%, #2d7a3a 50%, #4a9e5c 100%);"></td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // Plain text fallback
    const textContent = `
═══════════════════════════════════════
       COORG MASALA - Order Confirmation
═══════════════════════════════════════

Dear ${order.customerInfo.name},

Thank you for your purchase! Your order has been confirmed and is being prepared.

───────────────────────────────────────
ORDER DETAILS
───────────────────────────────────────

Order Number: ${order.orderId}
Order Date:   ${orderDate}

Items:
${order.items.map(item => `  • ${item.name} (x${item.quantity}) — ₹${item.subtotal.toFixed(2)}`).join('\n')}

                        Total: ₹${order.totalAmount.toFixed(2)}

───────────────────────────────────────
DELIVERY ADDRESS
───────────────────────────────────────

${order.customerInfo.name}
${shippingAddr.street}
${shippingAddr.city}, ${shippingAddr.state} - ${shippingAddr.pincode}
${shippingAddr.country}
Phone: ${order.customerInfo.phone}

───────────────────────────────────────
PAYMENT INFORMATION
───────────────────────────────────────

Method: ${paymentMethod}
Status: Paid
${order.paymentInfo.transactionId ? `Transaction ID: ${order.paymentInfo.transactionId}` : ''}

───────────────────────────────────────
TRACK YOUR ORDER
───────────────────────────────────────

${trackingLink}

───────────────────────────────────────

Need help? Contact us at support@coorgmasala.com

© ${new Date().getFullYear()} Coorg Masala. All rights reserved.
Authentic Spices · Handpicked Quality · Farm to Kitchen
    `.trim();

    const mailOptions = {
      from: `"Coorg Masala" <${process.env.SMTP_USER || 'support@coorgmasala.com'}>`,
      to: order.customerInfo.email,
      bcc: adminBcc,
      subject: `Order Confirmed — ${order.orderId} | Coorg Masala`,
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Order confirmation email sent to ${order.customerInfo.email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error.message);
    // Don't throw - email failure should not break the order flow
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
};
