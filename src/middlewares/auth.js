import passport from "../config/passport.config.js";

// valida JWT y popula req.user usando la estrategia "current"
export const requireJWT = passport.authenticate("current", { session: false });

// chequea permisos por rol
export const auth = (permisos = []) => {
  if (!Array.isArray(permisos)) {
    throw new Error("permisos debe ser un array");
  }
  const perms = new Set(permisos.map((p) => String(p).toLowerCase()));

  return (req, res, next) => {
    //  espera que antes haya pasado requireJWT
    const role = req.user?.role || req.user?.rol;
    if (!req.user || !role) {
      return res.status(401).json({ status: "error", error: "No autenticado" });
    }

    if (!perms.has(String(role).toLowerCase())) {
      return res
        .status(403)
        .json({ status: "error", error: "Sin privilegios" });
    }

    next();
  };
};
