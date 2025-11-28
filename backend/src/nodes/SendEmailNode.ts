import nodemailer from 'nodemailer';
import { ExecutionContext } from '../types';

export class SendEmailNode {
  private transporter: any;

  constructor() {
    // Create SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async execute(parameters: any, context: ExecutionContext): Promise<any> {
    const { to, subject, body, from, isHtml = false } = parameters;

    if (!to || !subject || !body) {
      throw new Error('To, subject, and body are required for Send Email node');
    }

    try {
      const mailOptions: any = {
        from: from || process.env.SMTP_USER,
        to,
        subject,
      };

      if (isHtml) {
        mailOptions.html = body;
      } else {
        mailOptions.text = body;
      }

      const info = await this.transporter.sendMail(mailOptions);

      return {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
      };
    } catch (error: any) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
