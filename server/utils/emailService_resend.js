const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOrderConfirmation = async (userEmail, userName, order) => {
  try {
    const itemsHTML = order.items.map(item => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #f0f0f0;">${item.name}</td>
        <td style="padding:12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
        <td style="padding:12px;border-bottom:1px solid #f0f0f0;text-align:right;">₹${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    await resend.emails.send({
      from: 'ShopMate <onboarding@resend.dev>',
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
            <p style="color:#6b7280;">Thank you for shopping with ShopMate!</p>
            <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:24px 0;">
              <p style="margin:0;color:#6b7280;font-size:14px;">Order ID</p>
              <p style="margin:4px 0 0;color:#1f2937;font-weight:bold;font-family:monospace;">
                #${order._id.toString().slice(-8).toUpperCase()}
              </p>
            </div>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f3f4f6;">
                  <th style="padding:12px;text-align:left;color:#6b7280;">Product</th>
                  <th style="padding:12px;text-align:center;color:#6b7280;">Qty</th>
                  <th style="padding:12px;text-align:right;color:#6b7280;">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHTML}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding:16px 12px;font-weight:bold;">Total</td>
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
    console.log('Order confirmation email sent! ✅');
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

const sendOrderStatusUpdate = async (userEmail, userName, order, newStatus) => {
  try {
    const statusConfig = {
      shipped: {
        emoji: '🚚', title: 'Your Order is On the Way!',
        bgColor: '#EFF6FF', textColor: '#1D4ED8',
        message: 'Your order has been shipped and is on its way!',
        subMessage: 'Track your order in the My Orders section.'
      },
      delivered: {
        emoji: '📦', title: 'Order Delivered Successfully!',
        bgColor: '#F3E8FF', textColor: '#6D28D9',
        message: 'Your order has been delivered. Hope you love it!',
        subMessage: 'Please leave a review to help other shoppers.'
      },
      paid: {
        emoji: '✅', title: 'Payment Confirmed!',
        bgColor: '#ECFDF5', textColor: '#065F46',
        message: 'Your payment is confirmed and order is being processed.',
        subMessage: 'We will notify you once shipped.'
      },
      failed: {
        emoji: '❌', title: 'Order Failed',
        bgColor: '#FEF2F2', textColor: '#991B1B',
        message: 'Unfortunately your order has failed.',
        subMessage: 'Please contact support if you need help.'
      }
    };

    const config = statusConfig[newStatus];
    if (!config) return;

    await resend.emails.send({
      from: 'ShopMate <onboarding@resend.dev>',
      to: userEmail,
      subject: `${config.emoji} ${config.title} - ShopMate`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#7C3AED,#4F46E5);padding:40px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;font-size:28px;">🛍️ ShopMate</h1>
            <p style="color:#DDD6FE;margin:8px 0 0;">Order Update</p>
          </div>
          <div style="background:#fff;padding:40px;border:1px solid #e5e7eb;">
            <h2 style="color:#1f2937;margin-top:0;">Hi ${userName}! 👋</h2>
            <div style="background:${config.bgColor};border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
              <p style="font-size:48px;margin:0;">${config.emoji}</p>
              <h3 style="color:${config.textColor};margin:8px 0 0;">${config.title}</h3>
              <p style="color:${config.textColor};margin:8px 0 0;">${config.message}</p>
            </div>
            <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:24px 0;">
              <p style="margin:0 0 8px;color:#6b7280;">Order ID:
                <strong style="color:#1f2937;font-family:monospace;">
                  #${order._id.toString().slice(-8).toUpperCase()}
                </strong>
              </p>
              <p style="margin:0 0 8px;color:#6b7280;">Amount:
                <strong style="color:#7C3AED;">₹${order.totalAmount.toLocaleString()}</strong>
              </p>
              <p style="margin:0;color:#6b7280;">Status:
                <strong style="color:${config.textColor};">${newStatus.toUpperCase()}</strong>
              </p>
            </div>
            <h4 style="color:#1f2937;">Order Items:</h4>
            ${order.items.map(item => `
              <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0f0f0;">
                <span>${item.name} × ${item.quantity}</span>
                <span style="color:#7C3AED;font-weight:bold;">₹${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            `).join('')}
            <p style="color:#6b7280;margin-top:24px;">${config.subMessage}</p>
            <div style="text-align:center;margin-top:24px;">
              <a href="${process.env.FRONTEND_URL || 'https://shopmate-snowy.vercel.app'}/orders"
                style="background:#7C3AED;color:white;padding:12px 32px;border-radius:8px;
                  text-decoration:none;font-weight:bold;">
                View My Orders
              </a>
            </div>
          </div>
          <div style="background:#f9fafb;padding:24px;text-align:center;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">© 2026 ShopMate. All rights reserved.</p>
          </div>
        </div>
      `
    });
    console.log('Status update email sent! ✅');
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

module.exports = { sendOrderConfirmation, sendOrderStatusUpdate };