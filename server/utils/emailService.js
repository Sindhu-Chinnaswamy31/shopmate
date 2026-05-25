const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// ── ORDER CONFIRMATION ──────────────────────────
const sendOrderConfirmation = async (userEmail, userName, order) => {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #f0f0f0;">${item.name}</td>
      <td style="padding:12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
      <td style="padding:12px;border-bottom:1px solid #f0f0f0;text-align:right;">₹${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  await transporter.sendMail({
    from: `"ShopMate" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: '🎉 Order Confirmed! - ShopMate',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#7C3AED,#4F46E5);padding:40px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:28px;">🛍️ ShopMate</h1>
          <p style="color:#DDD6FE;margin:8px 0 0;">Your order is confirmed!</p>
        </div>
        <div style="background:#fff;padding:40px;border:1px solid #e5e7eb;">
          <h2 style="color:#1f2937;margin-top:0;">Hi ${userName}! 👋</h2>
          <p style="color:#6b7280;">Thank you for shopping with ShopMate! Your order has been confirmed.</p>
          <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:24px 0;">
            <p style="margin:0;color:#6b7280;font-size:14px;">Order ID</p>
            <p style="margin:4px 0 0;color:#1f2937;font-weight:bold;font-family:monospace;">
              #${order._id.toString().slice(-8).toUpperCase()}
            </p>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="padding:12px;text-align:left;color:#6b7280;font-size:14px;">Product</th>
                <th style="padding:12px;text-align:center;color:#6b7280;font-size:14px;">Qty</th>
                <th style="padding:12px;text-align:right;color:#6b7280;font-size:14px;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:16px 12px;font-weight:bold;color:#1f2937;">Total</td>
                <td style="padding:16px 12px;font-weight:bold;color:#7C3AED;text-align:right;font-size:18px;">
                  ₹${order.totalAmount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
          <div style="background:#ecfdf5;border-radius:8px;padding:16px;margin-top:24px;text-align:center;">
            <p style="color:#065f46;margin:0;font-weight:bold;">✅ Payment Successful!</p>
          </div>
        </div>
        <div style="background:#f9fafb;padding:24px;text-align:center;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 ShopMate. All rights reserved.</p>
        </div>
      </div>
    `
  });
};

// ── ORDER STATUS UPDATE ─────────────────────────
const sendOrderStatusUpdate = async (userEmail, userName, order, newStatus) => {
  const statusConfig = {
    shipped: {
      emoji: '🚚',
      title: 'Your Order is On the Way!',
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      textColor: '#1D4ED8',
      message: 'Great news! Your order has been shipped and is on its way to you.',
      subMessage: 'You can track your order in the My Orders section.'
    },
    delivered: {
      emoji: '📦',
      title: 'Order Delivered Successfully!',
      color: '#7C3AED',
      bgColor: '#F3E8FF',
      textColor: '#6D28D9',
      message: 'Your order has been delivered. We hope you love your purchase!',
      subMessage: 'Please leave a review to help other shoppers.'
    },
    paid: {
      emoji: '✅',
      title: 'Payment Confirmed!',
      color: '#10B981',
      bgColor: '#ECFDF5',
      textColor: '#065F46',
      message: 'Your payment has been confirmed and your order is being processed.',
      subMessage: 'We will notify you once your order is shipped.'
    },
    failed: {
      emoji: '❌',
      title: 'Order Failed',
      color: '#EF4444',
      bgColor: '#FEF2F2',
      textColor: '#991B1B',
      message: 'Unfortunately your order has failed.',
      subMessage: 'Please contact support if you need help.'
    }
  };

  const config = statusConfig[newStatus];
  if (!config) return;

  await transporter.sendMail({
    from: `"ShopMate" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `${config.emoji} ${config.title} - ShopMate`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#7C3AED,#4F46E5);padding:40px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:28px;">🛍️ ShopMate</h1>
          <p style="color:#DDD6FE;margin:8px 0 0;">Order Update</p>
        </div>

        <!-- Body -->
        <div style="background:#fff;padding:40px;border:1px solid #e5e7eb;">
          <h2 style="color:#1f2937;margin-top:0;">Hi ${userName}! 👋</h2>

          <!-- Status Banner -->
          <div style="background:${config.bgColor};border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
            <p style="font-size:48px;margin:0;">${config.emoji}</p>
            <h3 style="color:${config.textColor};margin:8px 0 0;font-size:20px;">${config.title}</h3>
            <p style="color:${config.textColor};margin:8px 0 0;opacity:0.8;">${config.message}</p>
          </div>

          <!-- Order Info -->
          <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:24px 0;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#6b7280;font-size:14px;">Order ID</span>
              <span style="color:#1f2937;font-weight:bold;font-family:monospace;">
                #${order._id.toString().slice(-8).toUpperCase()}
              </span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#6b7280;font-size:14px;">Total Amount</span>
              <span style="color:#7C3AED;font-weight:bold;">₹${order.totalAmount.toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:#6b7280;font-size:14px;">Status</span>
              <span style="background:${config.bgColor};color:${config.textColor};
                padding:2px 10px;border-radius:20px;font-size:12px;font-weight:bold;">
                ${newStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <!-- Items -->
          <h4 style="color:#1f2937;margin-bottom:12px;">Order Items:</h4>
          ${order.items.map(item => `
            <div style="display:flex;justify-content:space-between;padding:10px 0;
              border-bottom:1px solid #f0f0f0;">
              <span style="color:#374151;">${item.name} × ${item.quantity}</span>
              <span style="color:#7C3AED;font-weight:bold;">₹${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          `).join('')}

          <p style="color:#6b7280;margin-top:24px;font-size:14px;">${config.subMessage}</p>

          <!-- CTA Button -->
          <div style="text-align:center;margin-top:24px;">
            <a href="${process.env.FRONTEND_URL || 'https://shopmate-snowy.vercel.app'}/orders"
              style="background:#7C3AED;color:white;padding:12px 32px;border-radius:8px;
                text-decoration:none;font-weight:bold;font-size:16px;">
              View My Orders
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f9fafb;padding:24px;text-align:center;
          border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 ShopMate. All rights reserved.</p>
          <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">
            Questions? Contact us at support@shopmate.com
          </p>
        </div>
      </div>
    `
  });
};

module.exports = { sendOrderConfirmation, sendOrderStatusUpdate };