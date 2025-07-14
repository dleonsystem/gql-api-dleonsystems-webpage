// src/lib/mails.ts
import nodemailer from 'nodemailer';
import logger from './logger';
import '../config/loadEnv';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true solo si usas puerto 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const enviarCorreo = async (to: string, subject: string, text: string) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return result;
    } catch (error) {
      logger.error('❌ Error al enviar correo:', error);
    throw error;
  }
};
