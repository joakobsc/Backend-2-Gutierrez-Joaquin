import { cartModel } from "../models/cart.model.js";
import { UserModel } from "../models/users.model.js";
import { generateToken } from "../utils/generateJWT.js";
import { COOKIE_NAME } from "../config/env.js";
import { UserDTO } from "../dto/user.dto.js";

const COOKIE_MAX_AGE = 60 * 60 * 1000; // 1 hora

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
  cartId: user.cartId,
});

// passport "register"
export const register = (req, res) => {
  if (!req.user) {
    return res
      .status(400)
      .json({ status: "error", message: "Registro fallido" });
  }
  return res
    .status(201)
    .json({ status: "success", payload: sanitizeUser(req.user) });
};

// passport "login" → generamos JWT y cookie
export const login = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ status: "error", message: "Credenciales inválidas" });
    }

    // Asegurar carrito
    let cartId = req.user.cartId?.toString?.() || null;
    if (!cartId) {
      const newCart = await cartModel.create({
        products: [],
        user: req.user._id,
      });
      cartId = newCart._id.toString();
      await UserModel.findByIdAndUpdate(req.user._id, { cartId });
      req.user.cartId = cartId;
    }

    // Firmar JWT
    const token = generateToken({
      _id: req.user._id,
      email: req.user.email,
      role: req.user.role || "user",
      cartId,
    });

    res.cookie(COOKIE_NAME, token, cookieOptions);

    return res.status(200).json({
      status: "success",
      message: "Login exitoso",
      payload: sanitizeUser(req.user),
      expiresAt: Date.now() + COOKIE_MAX_AGE,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res
      .status(500)
      .json({ status: "error", error: error?.message || "Error en login" });
  }
};

// logout
export const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions });
  return res.status(200).json({ status: "success", message: "Sesión cerrada" });
};

// current - protegido con requireJWT (estrategia "current")
export const current = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "No autenticado" });
  }
  return res
    .status(200)
    .json({ status: "success", payload: UserDTO.fromUser(req.user) });
};

export default { register, login, logout, current };
