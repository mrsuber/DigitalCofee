const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP connection error:', error);
      } else {
        console.log('SMTP server ready to send emails');
      }
    });
  }

  /**
   * Send a welcome email to new users
   */
  async sendWelcomeEmail(to, name) {
    try {
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: to,
        subject: 'Welcome to Digital Coffee! ☕',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6B4423 0%, #3D2817 100%); color: white; padding: 30px; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; }
              .button { display: inline-block; padding: 12px 30px; background: #6B4423; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Digital Coffee!</h1>
              </div>
              <div class="content">
                <h2>Hello ${name}! ☕</h2>
                <p>Thank you for joining Digital Coffee - your personal brainwave enhancement companion.</p>
                <p>We're excited to help you unlock your full potential with scientifically-designed binaural beats.</p>

                <h3>What's Next?</h3>
                <ul>
                  <li><strong>Alpha Waves (8-12 Hz):</strong> Perfect for creativity, relaxation, and ideation</li>
                  <li><strong>Beta Waves (12-30 Hz):</strong> Ideal for focus, alertness, and active thinking</li>
                </ul>

                <p>Start your first session today and experience the difference!</p>

                <a href="https://digitalcoffee.cafe" class="button">Get Started</a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Digital Coffee. All rights reserved.</p>
                <p>Brew Your Best Thoughts</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a notification email
   */
  async sendNotification(to, subject, message) {
    try {
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: to,
        subject: subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6B4423 0%, #3D2817 100%); color: white; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>☕ ${process.env.SMTP_FROM_NAME}</h2>
              </div>
              <div class="content">
                ${message}
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Digital Coffee. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Notification email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending notification email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test SMTP connection and send a test email
   */
  async sendTestEmail(to) {
    try {
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: to,
        subject: 'SMTP Test Email - Digital Coffee',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .success { background: #4CAF50; color: white; padding: 20px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success">
                <h2>✓ SMTP Configuration Successful!</h2>
                <p>Your email service is working correctly.</p>
                <p><strong>From:</strong> ${process.env.SMTP_FROM_EMAIL}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Test email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Test email failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
