// Dueño del carrito
export const requireOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const cid = String(req.params.cid || "");
  if (!cid) {
    return res.status(400).json({ error: "Falta parámetro cid" });
  }

  const userCartId = String(req.user?.cartId || "");
  if (userCartId && userCartId === cid) return next();

  return res
    .status(403)
    .json({ error: "Solo el dueño del carrito puede realizar esta acción" });
};
