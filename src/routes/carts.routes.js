import { Router } from "express";
import { cartModel } from "../models/cart.model.js";
import mongoose from "mongoose";
import { productsModel } from "../models/product.model.js";

const router = Router();

// POST: Crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const newCart = new cartModel({ products: req.body.products });
    await newCart.save();
    res.status(201).json(newCart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});
//GET: Obtener todos los carritos
router.get("/", async (req, res) => {
  try {
    // Obtener todos los carritos y poblar el campo 'productId' de cada producto
    const carts = await cartModel.find().populate("products.productId"); // Poblar el campo 'productId' para obtener los detalles del producto

    res.json(carts); // Enviar todos los carritos con los detalles de los productos
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los carritos" });
  }
});

// GET: Obtener un carrito por ID
router.get("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      return res.status(400).json({ error: "ID de carrito inválido" });
    }

    const cart = await cartModel
      .findById(cartId)
      .populate("products.productId");

    if (cart) {
      res.json(cart);
    } else {
      res.status(404).json({ error: "Carrito no encontrado" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});

// POST: Agregar un producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
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

    // Buscamos el producto en la base de datos
    const product = await productsModel.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Buscamos el carrito en la base de datos
    let cart = await cartModel.findById(cartId);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Verificamos si el producto ya existe en el carrito
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      // Si no existe, lo agregamos al carrito
      cart.products.push({ productId: productId, quantity: 1 });
    } else {
      // Si ya existe, aumentamos la cantidad
      cart.products[productIndex].quantity += 1;
    }

    // Guardamos el carrito actualizado
    await cart.save();

    // Poblar los detalles del producto (por ejemplo, nombre, precio)
    const populatedCart = await cartModel
      .findById(cartId)
      .populate("products.productId");

    // Enviar el carrito con los detalles del producto
    res.json(populatedCart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al agregar el producto al carrito" });
  }
});

// DELETE: Eliminar un producto específico del carrito
router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    // Validar que los IDs sean correctos
    if (
      !mongoose.Types.ObjectId.isValid(cartId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res
        .status(400)
        .json({ error: "ID de carrito o producto inválido" });
    }

    // Buscar el carrito
    const cart = await cartModel.findById(cartId);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Verificar si el producto existe en el carrito
    const productExists = cart.products.some(
      (item) => item.productId.toString() === productId
    );

    if (!productExists) {
      return res
        .status(404)
        .json({ error: "Producto no encontrado en el carrito" });
    }

    // Eliminar el producto específico del carrito
    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );

    // Guardar el carrito actualizado
    const updatedCart = await cart.save();

    // Usar populate para obtener los detalles del producto en la respuesta
    await updatedCart.populate("products.productId");

    res.json(updatedCart); // Devolver el carrito con los productos restantes
  } catch (error) {
    console.log("Error al eliminar el producto: ", error);
    res
      .status(500)
      .json({ error: "Error al eliminar el producto del carrito" });
  }
});

// PUT: Incrementar la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const { quantity } = req.body;

    // Validación de IDs
    if (
      !mongoose.Types.ObjectId.isValid(cartId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res
        .status(400)
        .json({ error: "ID de carrito o producto inválido" });
    }

    // Si no se pasa cantidad, le asignamos 1 por defecto
    const finalQuantity = quantity || 1;

    // Validar que la cantidad sea un número positivo
    if (isNaN(finalQuantity) || finalQuantity <= 0) {
      return res
        .status(400)
        .json({ error: "La cantidad debe ser un número positivo mayor que 0" });
    }

    // Buscar el carrito
    const cart = await cartModel.findById(cartId);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Buscar si el producto ya está en el carrito
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      // Si el producto no está en el carrito, lo agregamos
      cart.products.push({ productId, quantity: finalQuantity });
    } else {
      // Si el producto ya existe, actualizamos la cantidad
      cart.products[productIndex].quantity += finalQuantity; // sumamos la cantidad en vez de reemplazarla
    }

    // Guardamos el carrito actualizado
    await cart.save();

    // Poblar los detalles del producto y devolver el carrito
    const populatedCart = await cartModel
      .findById(cartId)
      .populate("products.productId");
    res.json(populatedCart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el carrito" });
  }
});

// PUT: actualizar el arreglo completo de productos de un carrito, con uno nuevo

router.put("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const newProducts = req.body.products;
    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      return res
        .status(400)
        .json({ error: "ID de carrito o producto inválido" });
    }

    if (!Array.isArray(newProducts)) {
      return res
        .status(400)
        .json({ error: "El arreglo de productos es inválido" });
    }

    // Buscar el carrito
    const cart = await cartModel.findById(cartId);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    } else {
      cart.products = newProducts;
      const updatedCart = await cart.save();
      res.json(updatedCart); // Devolver el carrito con los productos restantes
    }
  } catch (error) {
    console.log("Error al actualizar el carrito: ", error);
    res.status(500).json({ error: "Error al actualizar el carrito" });
  }
});

export default router;
