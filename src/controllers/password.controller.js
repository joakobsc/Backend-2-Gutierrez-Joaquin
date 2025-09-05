import { PasswordService } from "../services/password.service.js";
import { sendPasswordResetMail } from "../utils/mailer.js";

export class PasswordController {
  static request = async (req, res) => {
    try {
      const { email } = req.body || {};
      if (!email) return res.status(400).json({ error: "email requerido" });

      const result = await PasswordService.request(email);
      if (result) await sendPasswordResetMail(email, result.token);

      return res.status(200).json({ ok: true }); // siempre 200
    } catch (error) {
      return res.status(500).json({ error: error.message || "error interno" });
    }
  };

  static reset = async (req, res) => {
    try {
      const { token, password } = req.body || {};
      if (!token || !password)
        return res
          .status(400)
          .json({ error: "token y password son requeridos" });

      await PasswordService.reset(token, password);
      return res.status(200).json({ ok: true });
    } catch (error) {
      const msg = String(error.message || "");
      const status = /inválido|expirado|no encontrado|igual|datos/i.test(msg)
        ? 400
        : 500;
      return res.status(status).json({ error: msg });
    }
  };
}
