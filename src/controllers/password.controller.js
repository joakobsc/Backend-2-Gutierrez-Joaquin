import { sendPasswordResetMail } from "../utils/mailer.js";
import { PasswordService } from "../services/password.service.js";

export const PasswordController = {
  // generar token y enviar email de reset
  request: async (req, res) => {
    try {
      const { email } = req.body || {};
      if (!email) {
        return res.status(400).json({ ok: false, error: "Falta email" });
      }

      const result = await PasswordService.request(email);
      const token = typeof result === "string" ? result : result?.token;

      if (!token) {
        return res
          .status(500)
          .json({ ok: false, error: "No se pudo generar token" });
      }

      await sendPasswordResetMail(email, token);

      return res.json({
        ok: true,
        message: "Si el email existe, enviamos un enlace de recuperación",
      });
    } catch (err) {
      console.error("PasswordController.request error:", err);
      return res
        .status(500)
        .json({ ok: false, error: err?.message || "Error interno" });
    }
  },

  // resetear contraseña con token
  reset: async (req, res) => {
    try {
      const token = req.body?.token || req.query?.token;
      const { password } = req.body || {};

      if (!token || !password) {
        return res
          .status(400)
          .json({ ok: false, error: "Faltan token o password" });
      }

      await PasswordService.reset(token, password);

      return res.json({ ok: true, message: "Contraseña actualizada" });
    } catch (err) {
      const msg = err?.message || "Error al resetear";
      const isUserErr =
        /inválido|invalid|expirado|expired|igual|mismatch|usado|used/i.test(
          msg
        );
      return res.status(isUserErr ? 400 : 500).json({ ok: false, error: msg });
    }
  },
};

export default PasswordController;
