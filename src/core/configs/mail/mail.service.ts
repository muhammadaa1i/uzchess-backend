import { mailTransporter, SMTP_FROM } from "@/core/configs/mail/mail.config";

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
