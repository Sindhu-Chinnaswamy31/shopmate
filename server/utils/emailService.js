const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOrderConfirmation = async (userEmail, userName, order) => {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
        <strong>${item.name}</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right;">
        ₹${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"ShopMate" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: '🎉 Order Confirmed! - ShopMate',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7C3AED, #4F46E5); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🛍️ ShopMate</h1>
          <p style="color: #DDD6FE; margin: 8px 0 0;">Your order is confirmed!</p>
        </div>

        <!-- Body -->
        <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${userName}! 👋</h2>
          <p style="color: #6b7280;">
            Thank you for shopping with ShopMate! Your order has been confirmed and will be shipped soon.
          </p>

          <!-- Order Info -->
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Order ID</p>
            <p style="margin: 4px 0 0; color: #1f2937; font-weight: bold; font-family: monospace;">
              #${order._id.toString().slice(-8).toUpperCase()}
            </p>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 14px;">Product</th>
                <th style="padding: 12px; text-align: center; color: #6b7280; font-size: 14px;">Qty</th>
                <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 14px;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 16px 12px; font-weight: bold; color: #1f2937;">Total</td>
                <td style="padding: 16px 12px; font-weight: bold; color: #7C3AED; text-align: right; font-size: 18px;">
                  ₹${order.totalAmount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>

          <!-- Status -->
          <div style="background: #ecfdf5; border-radius: 8px; padding: 16px; margin-top: 24px; text-align: center;">
            <p style="color: #065f46; margin: 0; font-weight: bold;">
              ✅ Payment Successful — Your order is being processed!
            </p>
          </div>

          <p style="color: #6b7280; margin-top: 24px; font-size: 14px;">
            You can track your order status in the <strong>My Orders</strong> section of ShopMate.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © 2026 ShopMate. All rights reserved.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0;">
            Questions? Contact us at support@shopmate.com
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOrderConfirmation };