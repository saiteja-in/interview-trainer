import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL;

// export const sendTwoFactorTokenEmail = async (
//   email: string,
//   token: string
// ) => {
//   await resend.emails.send({
//     from: "mail@auth-masterclass-tutorial.com",
//     to: email,
//     subject: "2FA Code",
//     html: `<p>Your 2FA code: ${token}</p>`
//   });
// };

// export const sendPasswordResetEmail = async (
//   email: string,
//   token: string,
// ) => {
//   const resetLink = `${domain}/auth/new-password?token=${token}`

//   await resend.emails.send({
//     from: "mail@auth-masterclass-tutorial.com",
//     to: email,
//     subject: "Reset your password",
//     html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`
//   });
// };

export const sendVerificationEmail = async (
  email: string, 
  token: string
) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: "mail@saiteja.us",
    to: email,
    subject: "Confirm your email",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="
          margin: 0;
          padding: 0;
          background-color: #f0f4f8;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        ">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <!-- Main Container -->
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="
                  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
                  border-radius: 16px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
                  max-width: 90%;
                ">
                  <!-- Header Section -->
                  <tr>
                    <td style="padding: 40px 40px 30px 40px;">
                      <div style="
                        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                        border-radius: 12px;
                        padding: 30px;
                        text-align: center;
                        margin-bottom: 30px;
                      ">
                      
                        <h1 style="
                          color: #ffffff;
                          font-size: 28px;
                          font-weight: 700;
                          margin: 0;
                          letter-spacing: -0.5px;
                        ">
                          Verify Your Email Address
                        </h1>
                      </div>
                      
                      <!-- Welcome Message -->
                      <p style="
                        color: #1e293b;
                        font-size: 18px;
                        line-height: 1.6;
                        margin: 0 0 24px;
                        text-align: center;
                        padding: 0 20px;
                      ">
                        Welcome to our community! 🎉
                        <br/>
                        Please verify your email to get started.
                      </p>

                      <!-- Verification Button -->
                      <div style="text-align: center; padding: 20px 0;">
                        <a href="${confirmLink}" style="
                          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                          border-radius: 12px;
                          color: #ffffff;
                          display: inline-block;
                          font-size: 16px;
                          font-weight: 600;
                          line-height: 1;
                          padding: 20px 40px;
                          text-decoration: none;
                          text-align: center;
                          transition: all 0.3s ease;
                          box-shadow: 0 4px 6px rgba(79, 70, 229, 0.25);
                        ">
                          Verify My Email
                        </a>
                      </div>

                      <!-- Security Note -->
                      <div style="
                        background-color: #f8fafc;
                        border-radius: 12px;
                        padding: 20px;
                        margin: 30px 0;
                      ">
                        <p style="
                          color: #64748b;
                          font-size: 14px;
                          line-height: 1.6;
                          margin: 0;
                          text-align: center;
                        ">
                          🔒 For security reasons, this link will expire in 24 hours.
                          <br/>
                          If you didn't create an account, you can safely ignore this email.
                        </p>
                      </div>

                      <!-- Footer -->
                      <div style="
                        border-top: 1px solid #e2e8f0;
                        margin-top: 30px;
                        padding-top: 30px;
                      ">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center">
                              <p style="
                                color: #94a3b8;
                                font-size: 13px;
                                line-height: 1.5;
                                margin: 0;
                              ">
                                Having trouble with the button?
                                <br/>
                                Copy and paste this URL into your browser:
                              </p>
                              <p style="
                                margin: 8px 0 0;
                                font-size: 13px;
                              ">
                                <a href="${confirmLink}" style="
                                  color: #4f46e5;
                                  text-decoration: none;
                                  border-bottom: 1px solid #4f46e5;
                                ">
                                  ${confirmLink}
                                </a>
                              </p>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Footer Branding -->
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 90%;">
                  <tr>
                    <td style="padding: 24px 0; text-align: center;">
                      <p style="
                        color: #64748b;
                        font-size: 12px;
                        margin: 0;
                        font-weight: 500;
                      ">
                        Made with ❤️ by Sai Teja
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  });
};
export const sendPasswordResetEmail = async (
  email: string,
  token: string,
) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: "mail@saiteja.us",
    to: email,
    subject: "Reset your password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.8;
              color: #374151;
              margin: 0;
              padding: 0;
              background-color: #f3f4f6;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              padding: 40px 20px;
              background: linear-gradient(145deg, #ffffff 0%, #f9fafb 100%);
              border-radius: 16px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .header {
              text-align: center;
              padding: 30px;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              border-radius: 12px;
              margin-bottom: 32px;
              box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
            }
            .header-icon {
              font-size: 36px;
              margin-bottom: 10px;
            }
            .header-text {
              font-size: 28px;
              font-weight: 800;
              color: #ffffff;
              text-decoration: none;
              letter-spacing: -0.5px;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .content {
              padding: 32px;
              background-color: #ffffff;
              border-radius: 12px;
              border: 1px solid #e5e7eb;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            h2 {
              color: #1f2937;
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 24px;
              letter-spacing: -0.5px;
            }
            p {
              color: #4b5563;
              font-size: 16px;
              margin-bottom: 16px;
            }
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              transition: all 0.2s ease;
              box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2), 0 2px 4px -1px rgba(59, 130, 246, 0.1);
            }
            .button:hover {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              transform: translateY(-1px);
              box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.3);
            }
            .footer {
              text-align: center;
              margin-top: 32px;
              padding-top: 32px;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              font-size: 14px;
              color: #6b7280;
              margin: 8px 0;
            }
            .warning {
              background-color: #fff8f1;
              border-left: 4px solid #f97316;
              padding: 16px;
              border-radius: 6px;
              margin-top: 24px;
            }
            .warning p {
              color: #9a3412;
              font-size: 14px;
              margin: 0;
            }
            .divider {
              height: 1px;
              background: linear-gradient(to right, transparent, #e5e7eb, transparent);
              margin: 24px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-icon">🔐</div>
              <div class="header-text">Password Reset</div>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>Hello,</p>
              <p>We received a request to reset your password. To proceed with the password reset, please click the button below:</p>
              
              <div class="button-container">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              
              <div class="divider"></div>
              
              <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
              
              <div class="warning">
                <p><strong>⚠️ Security Notice:</strong> This password reset link will expire in 24 hours for your protection.</p>
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
  });
};
