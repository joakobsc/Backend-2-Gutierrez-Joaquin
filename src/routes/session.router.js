import { Router } from "express";
import passport from "../config/passport.config.js";
import sessionController from "../controllers/session.controller.js";
import { requireJWT } from "../middlewares/auth.js";

const router = Router();

// REGISTER
router.post("/register", (req, res, next) => {
  passport.authenticate("register", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      const msg = info?.message || "Datos inválidos para el registro";
      return res.status(400).json({ status: "error", error: msg });
    }
    req.user = user;
    return sessionController.register(req, res, next);
  })(req, res, next);
});

// LOGIN
router.post("/login", (req, res, next) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res
      .status(400)
      .json({ status: "error", error: "Todos los campos son obligatorios" });
  }

  passport.authenticate("login", { session: false }, (err, user, _info) => {
    if (err) return next(err);

    if (!user) {
      return res
        .status(401)
        .json({ status: "error", error: "Credenciales incorrectas" });
    }

    req.user = user;
    return sessionController.login(req, res, next);
  })(req, res, next);
});

// LOGOUT
router.post("/logout", sessionController.logout);

// CURRENT (JWT por cookie)
router.get("/current", requireJWT, sessionController.current);

// Handler de errores del router
router.use((error, req, res, _next) => {
  const isAuth = req.path === "/register" || req.path === "/login";
  const status = isAuth ? error.status || 400 : error.status || 401;
  const msg =
    error?.message ||
    (typeof error === "string" ? error : "Error de autenticación");
  return res.status(status).json({ status: "error", error: msg });
});

export default router;
