import jwt from "jsonwebtoken";
const JWT_SECRET = "JWTsecreta"; // solo para pruebas

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
