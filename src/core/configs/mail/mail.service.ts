import {
  CONTACT_EMAIL_TO,
  mailTransporter,
  SMTP_FROM,
} from "@/core/configs/mail/mail.config";

export async function sendVerificationCodeEmail(
  to: string,
  code: string,
): Promise<void> {
  await mailTransporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: "Tasdiqlash kodi",
    text: `Sizning tasdiqlash kodingiz: ${code}`,
    html: `<p>Sizning tasdiqlash kodingiz: <b>${code}</b></p>`,
  });
}

export async function sendContactNotificationEmail(
  name: string,
  email: string,
  message: string,
): Promise<void> {
  await mailTransporter.sendMail({
    from: SMTP_FROM,
    to: CONTACT_EMAIL_TO,
    subject: "Yangi murojaat (Contact form)",
    text: `Ism: ${name}\nEmail: ${email}\n\nXabar:\n${message}`,
    html: `<p><b>Ism:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Xabar:</b></p><p>${message}</p>`,
  });
}
