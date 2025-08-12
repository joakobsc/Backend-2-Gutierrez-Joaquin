import { Router } from "express";
import { productsModel } from "../models/product.model.js";
import { cartModel } from "../models/cart.model.js";
const router = Router();

//Ruta para la vista de inicio con PAGINACION

router.get("/products", async (req, res) => {
  try {
    // Verifica si ya existe un carrito en la sesión
    let cartId = req.session.cartId;

    // Si no hay un carrito en la sesión, crea uno nuevo

    if (!cartId) {
      const newCart = new cartModel({ products: [] });
      // Asignamos el ID del carrito a la sesión
      await newCart.save();
      // Asignamos el ID del carrito a la sesión
      cartId = newCart._id.toString();
      // Guardamos el ID del carrito en la sesión
      req.session.cartId = cartId;
    }

    // Crea un nuevo carrito vacío y guárdalo en la base de datos
    const newCart = new cartModel({ products: [] });
    await newCart.save();

    // Extraemos la página actual y la cantidad de productos por página
    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const skip = (page - 1) * limit;

    // Obtener productos con paginación
    const products = await productsModel.find().skip(skip).limit(limit);
    const totalProducts = await productsModel.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    // Agregar cartId a cada producto
    const productsWithCartId = products.map((product) => ({
      ...product.toObject(),
      cartId: cartId,
    }));

    // Renderizar la vista 'home' con los productos, carrito y paginación
    res.render("home", {
      products: productsWithCartId,
      cartId,
      currentPage: page,
      totalPages,
      style: "index.css",
    });
  } catch (error) {
    console.log("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// Ruta para la vista del carrito

router.get("/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params; // Obtener el cartId desde los parámetros
    const cart = await cartModel.findById(cid).populate("products.productId"); // Asegúrate de que `productId` esté correctamente referenciado en tu modelo

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    // Renderizar la vista del carrito con los productos específicos de ese carrito
    res.render("cart", {
      cart: cart.toObject(),
      style: "index.css",
    });
  } catch (error) {
    console.log("Error al obtener el carrito:", error);
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});

// Ruta para la vista de productos en tiempo real
router.get("/realtimeProducts", async (req, res) => {
  const products = await productsModel.find().lean(); // Obtiene todos los productos
  res.render("realTimeProducts", { products, style: "index.css" });
});

export default router;
