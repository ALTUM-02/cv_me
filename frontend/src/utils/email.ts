const EMAIL_API_URL = 'https://emailbackend.tarxemo.com/api/v1/send-email/';
const EMAIL_API_KEY = 'eak_UYX4uqer-5Ms0DkjvMrd9ABjxn8JwLnCE5_FBPKT_G8';
const EMAIL_API_SECRET = 'eas_5MVla54-G9woXq6IGW0VCQKRn7B5LSMQzRYCkywpCbZGqm_b8HAoP9S-5KOwrbkO';

export interface EmailPayload {
  recipient: string;
  subject: string;
  htmlBody: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export const sendEmail = async (payload: EmailPayload): Promise<EmailResponse> => {
  try {
    const response = await fetch(EMAIL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': EMAIL_API_KEY,
        'X-API-SECRET': EMAIL_API_SECRET,
      },
      body: JSON.stringify({
        recipient: payload.recipient,
        subject: payload.subject,
        html_body: payload.htmlBody,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: 'Email sent successfully!',
        data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to send email',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
};

/**
 * Generate a 6-digit OTP code
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send an OTP verification email via the EmailAPI platform
 */
export const sendOTPEmail = async (email: string, code: string): Promise<EmailResponse> => {
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
        .body { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .otp-box { background: white; border: 2px dashed #2563eb; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 36px; font-weight: 700; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace; }
        .note { font-size: 13px; color: #6b7280; text-align: center; margin-top: 15px; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ResumeForge - Verification Code</h1>
        </div>
        <div class="body">
          <p>Hello,</p>
          <p>We received a request to sign in to your ResumeForge account. Use the verification code below:</p>
          <div class="otp-box">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Your verification code</p>
            <div class="otp-code">${code}</div>
          </div>
          <p class="note">This code will expire in <strong>10 minutes</strong>. If you did not request this code, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ResumeForge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    recipient: email,
    subject: 'ResumeForge - Your Verification Code',
    htmlBody,
  });
};

export const generateCVShareEmail = (
  cvData: {
    firstName: string;
    lastName: string;
    email: string;
  },
  cvUrl: string,
  customMessage?: string
): EmailPayload => {
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .message { margin-bottom: 20px; }
        .cta-button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .footer a { color: #2563eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CV Shared With You</h1>
        </div>
        <div class="content">
          <div class="message">
            ${customMessage ? `<p>${customMessage}</p>` : `<p><strong>${cvData.firstName} ${cvData.lastName}</strong> has shared their professional CV with you.</p>`}
          </div>
          <p>Click the button below to view the full CV:</p>
          <a href="${cvUrl}" class="cta-button">View CV</a>
        </div>
        <div class="footer">
          <p>Powered by ResumeForge</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    recipient: cvData.email,
    subject: `${cvData.firstName} ${cvData.lastName} shared their CV with you`,
    htmlBody,
  };
};