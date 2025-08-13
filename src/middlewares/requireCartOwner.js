// middleware
import passport from "../config/passport.config.js";

export const requireJWT = passport.authenticate("current", { session: false });

export const requireAdmin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ error: "No autorizado (solo admin)" });
};

export const requireOwnerOrAdmin = (req, res, next) => {
  const isAdmin = req.user?.role === "admin";
  const owns = String(req.user?.cartId) === String(req.params.cid);
  if (isAdmin || owns) return next();
  return res.status(403).json({ error: "No autorizado" });
};
