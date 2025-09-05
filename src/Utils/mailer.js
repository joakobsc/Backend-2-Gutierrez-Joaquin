// src/utils/mailer.js
import nodemailer from "nodemailer";
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  APP_BASE_URL,
} from "../config/env.js";

// configurar transporter (Gmail + App Password)
export const transporter = nodemailer.createTransport({
  host: SMTP_HOST || "smtp.gmail.com",
  port: Number(SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// enviar email de reset con link y token
export async function sendPasswordResetMail(to, token) {
  const tokenStr = typeof token === "string" ? token : token?.token;
  if (!tokenStr) {
    throw new Error("No se recibió un token válido");
  }

  // generar link de reset
  const resetUrl = `${APP_BASE_URL}/api/password/reset?token=${encodeURIComponent(
    tokenStr
  )}`;

  const html = `
    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
    <p><a href="${resetUrl}" target="_blank" rel="noopener noreferrer">Restablecer contraseña</a></p>
  `;

  const info = await transporter.sendMail({
    from: `"Soporte" <${SMTP_USER}>`,
    to,
    subject: "Recuperar contraseña",
    text: `Enlace: ${resetUrl}`,
    html,
  });

  console.log("sendMail result:", {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
  });

  console.log("Reset URL (útil para pruebas):", resetUrl);

  return info;
}
