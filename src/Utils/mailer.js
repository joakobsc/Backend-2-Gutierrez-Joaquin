import nodemailer from "nodemailer";
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  APP_BASE_URL,
} from "../config/env.js";

const port = Number(SMTP_PORT ?? 587);

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure: port === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

/**
 * Envía mail con link de reseteo (expira en 1h).
 * @param {string} to - email destino
 * @param {string} token - token único
 */
export async function sendPasswordResetMail(to, token) {
  const url = `${APP_BASE_URL}/password/reset?token=${encodeURIComponent(
    token
  )}`;
  const html = `
    <p>Solicitaste restablecer tu contraseña.</p>
    <p>Este enlace expira en 1 hora:</p>
    <p>
      <a href="${url}" style="background:#4f46e5;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;">
        Restablecer contraseña
      </a>
    </p>
    <p>Si no fuiste vos, ignorá este correo.</p>
  `;
  await transporter.sendMail({
    from: `"Soporte" <${SMTP_USER}>`,
    to,
    subject: "Restablecer contraseña",
    html,
  });
}
