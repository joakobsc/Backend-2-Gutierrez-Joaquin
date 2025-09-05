import { Router } from "express";
import { CartsController } from "../controllers/carts.controller.js";
import { requireJWT, auth } from "../middlewares/auth.js";
import { requireOwner } from "../middlewares/requireCartOwner.js";

const router = Router();

//  Leer carrito  dueño
router.get("/:cid", requireJWT, requireOwner, CartsController.getCart);

//  Agregar producto  dueño
router.post(
  "/:cid/product/:pid",
  requireJWT,
  requireOwner,
  CartsController.addProduct
);

//  Eliminar producto  dueño
router.delete(
  "/:cid/product/:pid",
  requireJWT,
  requireOwner,
  CartsController.removeProduct
);

//  Reemplazar todos los productos  dueño
router.put("/:cid", requireJWT, requireOwner, CartsController.setProducts);

//  Vaciar carrito  dueño
router.delete("/:cid", requireJWT, requireOwner, CartsController.clear);

//  Comprar carrito  dueño (genera ticket)
router.post(
  "/:cid/purchase",
  requireJWT,
  requireOwner,
  CartsController.purchase
);

//  Traer todos los carritos  admin
router.get("/", requireJWT, auth(["admin"]), CartsController.getAllCarts);

export default router;
