const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Verify SMTP connection
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }

  // Student welcome email template
  getStudentEmailTemplate(studentData) {
    const { name, email, password } = studentData;
    const loginUrl = process.env.LOGIN_URL;
    const platformName = process.env.PLATFORM_NAME;

    return {
      subject: `Welcome to ${platformName} 🎓`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${platformName}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Welcome to ${platformName}!</h1>
              <p>Your academic journey starts here</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Welcome to ${platformName}! Your student account has been successfully created. You can now access your personalized dashboard to manage your academic profile, upload achievements, and track your progress.</p>
              
              <div class="credentials">
                <h3>📧 Your Login Credentials</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${password}</p>
              </div>

              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">🚀 Login to Your Dashboard</a>
              </div>

              <div class="warning">
                <h4>🔒 Important Security Notice</h4>
                <p><strong>Please change your password immediately after your first login</strong> for security purposes. You can update your password in your profile settings.</p>
              </div>

              <h3>🌟 What you can do:</h3>
              <ul>
                <li>📝 Complete your profile information</li>
                <li>🏆 Upload your achievements and certificates</li>
                <li>📊 Track your academic progress</li>
                <li>🎯 Set and monitor your goals</li>
                <li>📱 Access your digital portfolio</li>
              </ul>

              <p>If you have any questions or need assistance, please don't hesitate to contact your faculty or our support team.</p>
            </div>
            <div class="footer">
              <p>© 2024 ${platformName}. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  // College welcome email template
  getCollegeEmailTemplate(collegeData) {
    const { name, email, password } = collegeData;
    const loginUrl = process.env.LOGIN_URL;
    const platformName = process.env.PLATFORM_NAME;

    return {
      subject: `Welcome to ${platformName} 🏫`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${platformName}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #11998e; }
            .button { display: inline-block; background: #11998e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏫 Welcome to ${platformName}!</h1>
              <p>Empowering Educational Excellence</p>
            </div>
            <div class="content">
              <h2>Welcome ${name}!</h2>
              <p>Congratulations! Your college has been successfully registered on ${platformName}. You now have access to our comprehensive educational management platform to oversee your institution's academic activities.</p>
              
              <div class="credentials">
                <h3>🔑 Your Login Credentials</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${password}</p>
              </div>

              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">🎯 Access College Dashboard</a>
              </div>

              <div class="warning">
                <h4>🔒 Important Security Notice</h4>
                <p><strong>Please change your password immediately after your first login</strong> for security purposes. You can update your password in your college profile settings.</p>
              </div>

              <h3>🚀 Platform Features:</h3>
              <ul>
                <li>👥 Manage faculty and student accounts</li>
                <li>📚 Oversee department operations</li>
                <li>📊 Access comprehensive analytics and reports</li>
                <li>🎓 Track student achievements and progress</li>
                <li>📅 Manage events and announcements</li>
                <li>💼 Generate institutional reports</li>
              </ul>

              <p>Our platform is designed to streamline your college's administrative processes and enhance the educational experience for both faculty and students.</p>

              <p>For technical support or platform guidance, please contact our support team or refer to the help documentation available in your dashboard.</p>
            </div>
            <div class="footer">
              <p>© 2024 ${platformName}. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  // Send email with logging
  async sendEmail(to, template, recipientData, logContext = {}) {
    console.log(`📧 EmailService.sendEmail called with:`, {
      to,
      template,
      recipientName: recipientData.name,
      logContext
    });

    try {
      // Check if required environment variables are set
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('Missing SMTP configuration in environment variables');
      }

      const emailContent = template === 'student' 
        ? this.getStudentEmailTemplate(recipientData)
        : this.getCollegeEmailTemplate(recipientData);

      console.log(`📧 Email template generated for ${template}:`, {
        subject: emailContent.subject,
        htmlLength: emailContent.html.length
      });

      const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: to,
        subject: emailContent.subject,
        html: emailContent.html
      };

      console.log(`📧 Sending email with options:`, {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const result = await this.transporter.sendMail(mailOptions);
      
      // Log success
      console.log(`✅ Email sent successfully to ${to}`, {
        messageId: result.messageId,
        template: template,
        context: logContext,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        messageId: result.messageId,
        recipient: to
      };

    } catch (error) {
      // Log failure
      console.error(`❌ Failed to send email to ${to}:`, {
        error: error.message,
        stack: error.stack,
        template: template,
        context: logContext,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        error: error.message,
        recipient: to
      };
    }
  }

  // Bulk email sending with progress tracking
  async sendBulkEmails(recipients, template, logContext = {}) {
    const results = {
      total: recipients.length,
      successful: 0,
      failed: 0,
      details: []
    };

    console.log(`📧 Starting bulk email send: ${recipients.length} recipients`);

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const progress = `${i + 1}/${recipients.length}`;
      
      console.log(`📤 Sending email ${progress} to ${recipient.email}`);

      const result = await this.sendEmail(
        recipient.email,
        template,
        recipient,
        { ...logContext, progress }
      );

      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
      }

      results.details.push({
        email: recipient.email,
        name: recipient.name,
        success: result.success,
        messageId: result.messageId,
        error: result.error
      });

      // Add small delay to avoid overwhelming SMTP server
      if (i < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`📊 Bulk email completed: ${results.successful} successful, ${results.failed} failed`);
    return results;
  }
}

module.exports = new EmailService();
