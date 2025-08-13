// src/routes/session.router.js
import { Router } from "express";
import passport from "../config/passport.config.js";
import sessionController from "../controllers/session.controller.js";

const router = Router();

// REGISTER → si falla, responde JSON con error
router.post(
  "/register",
  passport.authenticate("register", { session: false, failWithError: true }),
  sessionController.register
);

// LOGIN → si falla, responde JSON con error
router.post(
  "/login",
  passport.authenticate("login", { session: false, failWithError: true }),
  sessionController.login
);

// LOGOUT (dejamos GET como tenías)
router.post("/logout", sessionController.logout);

// CURRENT (JWT por cookie) → si falla, 401 JSON
router.get(
  "/current",
  passport.authenticate("current", { session: false, failWithError: true }),
  sessionController.current
);

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
