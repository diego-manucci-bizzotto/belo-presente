import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({to, subject, text, html,}: { to: string; subject: string; text?: string; html?: string; }) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      text: text || html?.replace(/<[^>]*>?/gm, ""),
      html,
    });

    console.log("Email sent:", info.messageId);
  }
  catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}