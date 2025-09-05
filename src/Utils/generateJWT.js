import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export const generateToken = (user) => {
  const id = user._id?.toString?.() || user.id;
  if (!id) {
    throw new Error("generateToken: falta el id del usuario");
  }

  const payload = {
    id,
    email: user.email,
    role: user.role || "user",
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
};
