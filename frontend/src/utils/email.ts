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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const postEmailRequest = async (
  path: string,
  payload: Record<string, string>,
  authenticated = false
): Promise<EmailResponse> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('auth_token');

  if (authenticated && token) {
    headers.Authorization = `JWT ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }

  let responseData: unknown;
  try {
    responseData = await response.json();
  } catch {
    return {
      success: false,
      message: 'The email service returned an invalid response.',
    };
  }

  if (!isRecord(responseData)) {
    return {
      success: false,
      message: 'The email service returned an invalid response.',
    };
  }

  if (!response.ok || responseData.success !== true) {
    return {
      success: false,
      message: typeof responseData.message === 'string'
        ? responseData.message
        : 'Failed to send email.',
    };
  }

  return {
    success: true,
    message: typeof responseData.message === 'string'
      ? responseData.message
      : 'Email sent successfully.',
    data: isRecord(responseData.data) ? responseData.data : undefined,
  };
};

export const sendEmail = async (payload: EmailPayload): Promise<EmailResponse> => {
  return postEmailRequest(
    '/api/email/send/',
    {
      recipient: payload.recipient,
      subject: payload.subject,
      html_body: payload.htmlBody,
    },
    true
  );
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
