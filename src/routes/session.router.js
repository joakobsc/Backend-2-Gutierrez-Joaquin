import { Router } from "express";
import passport from "../config/passport.config.js";
import sessionController from "../controllers/session.controller.js";
import { requireJWT } from "../middlewares/auth.js"; // ✅ unificamos

const router = Router();

// REGISTER
router.post(
  "/register",
  passport.authenticate("register", { session: false, failWithError: true }),
  sessionController.register
);

// LOGIN
router.post(
  "/login",
  passport.authenticate("login", { session: false, failWithError: true }),
  sessionController.login
);

// LOGOUT
router.post("/logout", sessionController.logout);

// CURRENT (JWT por cookie) — ✅ usamos requireJWT para mantener consistencia
router.get("/current", requireJWT, sessionController.current);

// Manejo de errores central de passport.* (register/login)
router.use((error, req, res, _next) => {
  const status = error.status || 401;
  const msg =
    error.message ||
    (typeof error === "string"
      ? error
      : "Credenciales inválidas o token inválido");
  return res.status(status).json({ status: "error", error: msg });
});

export default router;
