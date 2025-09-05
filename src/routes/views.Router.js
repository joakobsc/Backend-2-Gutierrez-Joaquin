// src/routes/views.router.js
import { Router } from "express";
import { productsModel } from "../models/product.model.js";
import { cartModel } from "../models/cart.model.js";
import { requireJWT } from "../middlewares/auth.js";
import { requireOwner } from "../middlewares/requireCartOwner.js";

const router = Router();

router.get("/", (_req, res) => {
  res.render("home", { style: "index.css" });
});

router.get("/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      productsModel.find().skip(skip).limit(limit).lean(),
      productsModel.countDocuments(),
    ]);

    res.render("products", {
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      style: "index.css",
    });
  } catch (error) {
    console.log("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

/* Carrito: solo dueño (owner-only) */
router.get(
  "/cart/:cid",
  requireJWT, // valida JWT y popula req.user
  requireOwner, // verifica que :cid sea el cartId del usuario
  async (req, res) => {
    try {
      const { cid } = req.params;
      const cart = await cartModel
        .findById(cid)
        .populate("products.productId")
        .lean();

      if (!cart) {
        return res.status(404).json({ message: "Carrito no encontrado" });
      }

      return res.render("cart", { cart, style: "index.css" });
    } catch (error) {
      console.log("Error al obtener el carrito:", error);
      res.status(500).json({ error: "Error al obtener el carrito" });
    }
  }
);

router.get("/carts/:cid", (req, res) => {
  res.redirect(`/cart/${req.params.cid}`);
});

router.get("/register", (_req, res) => {
  res.render("register", { style: "index.css" });
});

export default router;
