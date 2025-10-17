import nodemailer from "nodemailer";

const requiredEnv = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "MAIL_FROM",
];

const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  // eslint-disable-next-line no-console
  console.warn(
    `Missing SMTP env vars: ${missing.join(
      ", "
    )}. Email sending will be disabled.`
  );
}

let transporter = null;
if (missing.length === 0) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export const isEmailEnabled = () => Boolean(transporter);

export const sendMail = async ({ to, subject, html, text }) => {
  if (!transporter) return { accepted: [], rejected: [to], disabled: true };
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  });
  return info;
};

export default { sendMail, isEmailEnabled };
