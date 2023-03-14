import nodemailer from "nodemailer";

const sendEmail = async (emailObject) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    service: process.env.SMTP_SERVICE_NAME,
    auth: {
      user: process.env.SMTP_MAIL_ID,
      pass: process.env.SMTP_PSWD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL_ID,
    to: emailObject.email,
    subject: emailObject.subject,
    text: emailObject.message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
