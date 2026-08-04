export const verificationEmailTemplate = (name: string, code: string) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Email</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f5f7; font-family: 'Segoe UI', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
            <tr>
              <td style="background: linear-gradient(135deg, #059669, #0f766e); padding:28px 32px;">
                <span style="color:#ffffff; font-size:20px; font-weight:800; letter-spacing:-0.5px;">
                  Project<span style="color:#d1fae5;">Hive</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h2 style="margin:0 0 12px; font-size:20px; color:#111827;">Hi ${name},</h2>
                <p style="margin:0 0 20px; font-size:14px; line-height:1.6; color:#4b5563;">
                  Welcome to ProjectHive! Please use the verification code below to confirm your email address and activate your account.
                  This code expires in <strong>10 minutes</strong>.
                </p>
                <div style="text-align:center; margin:28px 0;">
                  <span style="display:inline-block; background-color:#ecfdf5; border:1px solid #a7f3d0; color:#047857; font-size:28px; font-weight:700; letter-spacing:6px; padding:14px 28px; border-radius:12px;">
                    ${code}
                  </span>
                </div>
                <p style="margin:0 0 8px; font-size:13px; line-height:1.6; color:#6b7280;">
                  If you didn't create an account with ProjectHive, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; background-color:#f9fafb; border-top:1px solid #f0f0f0;">
                <p style="margin:0; font-size:11px; color:#9ca3af; text-align:center;">
                  © ${new Date().getFullYear()} ProjectHive · Secure Corporate Provisioning
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

export const passwordResetEmailTemplate = (name: string, code: string) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f5f7; font-family: 'Segoe UI', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
            <tr>
              <td style="background: linear-gradient(135deg, #059669, #0f766e); padding:28px 32px;">
                <span style="color:#ffffff; font-size:20px; font-weight:800; letter-spacing:-0.5px;">
                  Project<span style="color:#d1fae5;">Hive</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h2 style="margin:0 0 12px; font-size:20px; color:#111827;">Hi ${name},</h2>
                <p style="margin:0 0 20px; font-size:14px; line-height:1.6; color:#4b5563;">
                  We received a request to reset the password for your ProjectHive account.
                  Use the code below to continue. This code expires in <strong>15 minutes</strong>.
                </p>
                <div style="text-align:center; margin:28px 0;">
                  <span style="display:inline-block; background-color:#ecfdf5; border:1px solid #a7f3d0; color:#047857; font-size:28px; font-weight:700; letter-spacing:6px; padding:14px 28px; border-radius:12px;">
                    ${code}
                  </span>
                </div>
                <p style="margin:0 0 8px; font-size:13px; line-height:1.6; color:#6b7280;">
                  If you didn't request a password reset, you can safely ignore this email —
                  your password will remain unchanged.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; background-color:#f9fafb; border-top:1px solid #f0f0f0;">
                <p style="margin:0; font-size:11px; color:#9ca3af; text-align:center;">
                  © ${new Date().getFullYear()} ProjectHive · Secure Corporate Provisioning
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};