import { createTransport } from "nodemailer";

export const mailTransporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 10_000,
});

export const SMTP_FROM = process.env.SMTP_FROM!;

// Recipient for admin notifications (e.g. contact form submissions).
// Falls back to SMTP_FROM so this works out of the box without extra config.
export const CONTACT_EMAIL_TO = process.env.CONTACT_EMAIL_TO || SMTP_FROM;
