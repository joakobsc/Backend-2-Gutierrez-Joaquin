import { Router } from "express";
import passport from "passport";
import {
  register,
  login,
  logout,
  current,
} from "../controllers/session.controller.js";

const router = Router();

// Registro
router.post("/register", register);

// Login
router.post("/login", login);

// Logout
router.get("/logout", logout);

// Ruta protegida con JWT
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  current
);

export default router;
