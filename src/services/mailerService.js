import nodemailer from "nodemailer";

// Support both SMTP_* and EMAIL_* environment variable formats
const getEmailConfig = () => {
  // Try SMTP_* format first (new format)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      from: process.env.MAIL_FROM || process.env.EMAIL_USER,
    };
  }

  // Fall back to EMAIL_* format (existing format)
  if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return {
      service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      from: process.env.MAIL_FROM || `"Contest Buddy" <${process.env.EMAIL_USER}>`,
    };
  }

  return null;
};

const emailConfig = getEmailConfig();

if (!emailConfig) {
  console.warn(
    "Email configuration not found. Please set either:\n" +
    "  - SMTP_HOST, SMTP_USER, SMTP_PASS (and optionally SMTP_PORT, MAIL_FROM)\n" +
    "  - EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD\n" +
    "Email sending will be disabled."
  );
}

let transporter = null;
if (emailConfig) {
  transporter = nodemailer.createTransport(emailConfig);
  console.log("✓ Email service configured successfully");
}

export const isEmailEnabled = () => Boolean(transporter);

export const sendMail = async ({ to, subject, html, text }) => {
  if (!transporter) return { accepted: [], rejected: [to], disabled: true };
  
  const info = await transporter.sendMail({
    from: emailConfig.from,
    to,
    subject,
    text,
    html,
  });
  return info;
};

export default { sendMail, isEmailEnabled };
