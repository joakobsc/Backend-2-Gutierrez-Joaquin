import { Router } from "express";
import { ProductsController } from "../controllers/products.controller.js";
import { requireJWT, auth } from "../middlewares/auth.js";

const router = Router();

// Públicas
router.get("/", ProductsController.getProducts);
router.get("/:pid", ProductsController.getProductById);

// Solo admin
router.post("/", requireJWT, auth(["admin"]), ProductsController.createProduct);
router.put(
  "/:pid",
  requireJWT,
  auth(["admin"]),
  ProductsController.updateProduct
);
router.delete(
  "/:pid",
  requireJWT,
  auth(["admin"]),
  ProductsController.deleteProduct
);

export default router;
