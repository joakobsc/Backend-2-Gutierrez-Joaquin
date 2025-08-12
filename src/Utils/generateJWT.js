import jwt from "jsonwebtoken";

const JWT_SECRET = "JWTsecreta"; // en producción siempre desde env

export const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role || "user",
  };

  const options = {
    expiresIn: "1d", // token válido 1 día
  };

  return jwt.sign(payload, JWT_SECRET, options);
};
