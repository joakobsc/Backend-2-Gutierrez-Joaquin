// src/controllers/session.controller.js
import jwt from "jsonwebtoken";
import { UserModel } from "../models/users.model.js";
import { createUser } from "../Utils/user.Utils.js";
import { comparePassword } from "../Utils/passwordUtils.js";

const JWT_SECRET = "JWTsecreta"; // mantenelo sincronizado con tu util
const COOKIE_NAME = "tokenCookie";
const COOKIE_MAX_AGE = 60 * 60 * 1000; // 1 hora en ms

const signToken1h = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role || "user",
  };
  return jwt.sign(payload, "JWTsecreta", { expiresIn: "1h" });
};

const cookieOptions = {
  httpOnly: true,
  maxAge: COOKIE_MAX_AGE,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

const sanitizeUser = (user) => ({
  id: user._id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  age: user.age,
  role: user.role,
  cart: user.cart,
});

// POST /api/sessions/register
export const register = async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Datos incompletos" });
    }

    const exists = await UserModel.findOne({ email });
    if (exists) {
      return res.status(409).json({
        status: "error",
        message: "Ya existe un usuario con ese email",
      });
    }

    const user = await createUser({
      first_name,
      last_name,
      email,
      age,
      password,
    });

    // No auto-login: cumplimiento estricto de la consigna (login emite el JWT)
    return res
      .status(201)
      .json({ status: "success", payload: sanitizeUser(user) });
  } catch (err) {
    return res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
};

// POST /api/sessions/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación básica sin revelar detalles
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Credenciales incorrectas" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ status: "error", message: "Credenciales incorrectas" });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res
        .status(401)
        .json({ status: "error", message: "Credenciales incorrectas" });
    }

    const token = signToken1h(user);
    res.cookie(COOKIE_NAME, token, cookieOptions);

    return res.status(200).json({
      status: "success",
      message: "Login exitoso",
      payload: sanitizeUser(user),
      expiresAt: Date.now() + COOKIE_MAX_AGE,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
};

// GET /api/sessions/logout
export const logout = async (req, res) => {
  try {
    // Importante: usar mismos flags que al setear (sameSite/secure/httpOnly) para que se borre bien
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return res
      .status(200)
      .json({ status: "success", message: "Sesión cerrada" });
  } catch (err) {
    return res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
};

// GET /api/sessions/current (protegida con passport.authenticate('jwt', { session:false }))
export const current = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ status: "error", message: "No autenticado" });
    }
    return res
      .status(200)
      .json({ status: "success", payload: sanitizeUser(req.user) });
  } catch (err) {
    return res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
};

export default {
  register,
  login,
  logout,
  current,
};
