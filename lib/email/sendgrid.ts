import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export interface SendEmailParams {
  to: string;
  from: string;
  fromName: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<string | null> {
  try {
    const msg = {
      to: params.to,
      from: {
        email: params.from,
        name: params.fromName,
      },
      subject: params.subject,
      text: params.text,
      html: params.html || params.text.replace(/\n/g, '<br>'),
    };

    const [response] = await sgMail.send(msg);
    
    // Return message ID if available
    const messageId = response.headers['x-message-id'];
    return messageId || null;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function setupInboundParsing(domain: string, hostname: string) {
  // This is a helper function to document the setup process
  // Actual setup must be done in SendGrid dashboard:
  // 1. Go to Settings > Inbound Parse
  // 2. Add domain: in.offertpilot.se
  // 3. Set URL to: https://yourdomain.com/api/webhooks/email/inbound
  // 4. Add MX records to DNS:
  //    MX 10 mx.sendgrid.net
  
  console.log(`
    SendGrid Inbound Parse Setup:
    1. Add domain: ${domain}
    2. Set webhook URL: ${hostname}/api/webhooks/email/inbound
    3. Add MX record: MX 10 mx.sendgrid.net
  `);
}
