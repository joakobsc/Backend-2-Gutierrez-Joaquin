// src/routes/carts.router.js
import { Router } from "express";
import mongoose from "mongoose";
import { cartModel } from "../models/cart.model.js";
import { productsModel } from "../models/product.model.js";
import {
  requireJWT,
  requireAdmin,
  requireOwnerOrAdmin,
} from "../middlewares/requireCartOwner.js";

const router = Router();

// POST: Crear un nuevo carrito (asigna al usuario autenticado)
router.post("/", requireJWT, async (req, res) => {
  try {
    const products = Array.isArray(req.body.products) ? req.body.products : [];
    const newCart = await cartModel.create({
      products,
      user: req.user._id,
    });
    res.status(201).json(newCart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});

// GET: Obtener todos los carritos (solo admin)
router.get("/", requireJWT, requireAdmin, async (req, res) => {
  try {
    const carts = await cartModel.find().populate("products.productId");
    res.json(carts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los carritos" });
  }
});

// GET: Obtener un carrito por ID (dueño o admin)
router.get("/:cid", requireJWT, requireOwnerOrAdmin, async (req, res) => {
  try {
    const cartId = req.params.cid;

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      return res.status(400).json({ error: "ID de carrito inválido" });
    }

    const cart = await cartModel
      .findById(cartId)
      .populate("products.productId");

    if (cart) return res.json(cart);
    return res.status(404).json({ error: "Carrito no encontrado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});

// POST: Agregar un producto al carrito (dueño o admin)
router.post(
  "/:cid/product/:pid",
  requireJWT,
  requireOwnerOrAdmin,
  async (req, res) => {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;

      if (
        !mongoose.Types.ObjectId.isValid(cartId) ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        return res
          .status(400)
          .json({ error: "ID de carrito o producto inválido" });
      }

      const product = await productsModel.findById(productId);
      if (!product)
        return res.status(404).json({ error: "Producto no encontrado" });

      let cart = await cartModel.findById(cartId);
      if (!cart)
        return res.status(404).json({ error: "Carrito no encontrado" });

      const idx = cart.products.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (idx === -1) {
        cart.products.push({ productId, quantity: 1 });
      } else {
        cart.products[idx].quantity += 1;
      }

      await cart.save();
      await cart.populate("products.productId");
      res.json(cart);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "Error al agregar el producto al carrito" });
    }
  }
);

// DELETE: Eliminar un producto específico del carrito (dueño o admin)
router.delete(
  "/:cid/product/:pid",
  requireJWT,
  requireOwnerOrAdmin,
  async (req, res) => {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;

      if (
        !mongoose.Types.ObjectId.isValid(cartId) ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        return res
          .status(400)
          .json({ error: "ID de carrito o producto inválido" });
      }

      const cart = await cartModel.findById(cartId);
      if (!cart)
        return res.status(404).json({ error: "Carrito no encontrado" });

      const productExists = cart.products.some(
        (item) => item.productId.toString() === productId
      );
      if (!productExists) {
        return res
          .status(404)
          .json({ error: "Producto no encontrado en el carrito" });
      }

      cart.products = cart.products.filter(
        (item) => item.productId.toString() !== productId
      );

      await cart.save();
      await cart.populate("products.productId");
      res.json(cart);
    } catch (error) {
      console.log("Error al eliminar el producto: ", error);
      res
        .status(500)
        .json({ error: "Error al eliminar el producto del carrito" });
    }
  }
);

// PUT: Incrementar la cantidad de un producto en el carrito (dueño o admin)
router.put(
  "/:cid/products/:pid",
  requireJWT,
  requireOwnerOrAdmin,
  async (req, res) => {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
      const { quantity } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(cartId) ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        return res
          .status(400)
          .json({ error: "ID de carrito o producto inválido" });
      }

      const finalQuantity = Number(quantity ?? 1);
      if (!Number.isInteger(finalQuantity) || finalQuantity <= 0) {
        return res.status(400).json({
          error: "La cantidad debe ser un número positivo mayor que 0",
        });
      }

      const cart = await cartModel.findById(cartId);
      if (!cart)
        return res.status(404).json({ error: "Carrito no encontrado" });

      const idx = cart.products.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (idx === -1) {
        cart.products.push({ productId, quantity: finalQuantity });
      } else {
        cart.products[idx].quantity += finalQuantity;
      }

      await cart.save();
      await cart.populate("products.productId");
      res.json(cart);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error al actualizar el carrito" });
    }
  }
);

// PUT: reemplazar el arreglo completo de productos (dueño o admin)
router.put("/:cid", requireJWT, requireOwnerOrAdmin, async (req, res) => {
  try {
    const cartId = req.params.cid;
    const newProducts = req.body.products;

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      return res.status(400).json({ error: "ID de carrito inválido" });
    }
    if (!Array.isArray(newProducts)) {
      return res
        .status(400)
        .json({ error: "El arreglo de productos es inválido" });
    }

    const cart = await cartModel.findById(cartId);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = newProducts;
    await cart.save();
    await cart.populate("products.productId");
    res.json(cart);
  } catch (error) {
    console.log("Error al actualizar el carrito: ", error);
    res.status(500).json({ error: "Error al actualizar el carrito" });
  }
});

// DELETE: vaciar el carrito completo (dueño o admin)
router.delete("/:cid", requireJWT, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { cid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.status(400).json({ error: "ID de carrito inválido" });
    }

    const cart = await cartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = [];
    await cart.save();
    await cart.populate("products.productId");
    return res.json(cart);
  } catch (error) {
    console.log("Error al vaciar el carrito:", error);
    return res.status(500).json({ error: "Error al vaciar el carrito" });
  }
});

export default router;
