import { cartsService } from "../services/carts.service.js";
import { PurchaseService } from "../services/purchase.service.js";

export class CartsController {
  static getCart = async (req, res) => {
    try {
      const cart = await cartsService.getCartById(req.params.cid);
      return res.status(200).json(cart);
    } catch (error) {
      const status = /inválido|no encontrado/i.test(error.message) ? 404 : 500;
      return res.status(status).json({ error: error.message });
    }
  };

  static addProduct = async (req, res) => {
    try {
      const { cid, pid } = req.params;
      const quantity = Number(req.body?.quantity ?? 1);
      const cart = await cartsService.addToCart(cid, pid, quantity);
      return res.status(200).json(cart);
    } catch (error) {
      const status = /inválido|no encontrado/i.test(error.message) ? 400 : 500;
      return res.status(status).json({ error: error.message });
    }
  };

  static removeProduct = async (req, res) => {
    try {
      const { cid, pid } = req.params;
      const cart = await cartsService.removeFromCart(cid, pid);
      return res.status(200).json(cart);
    } catch (error) {
      const status = /inválido|no encontrado/i.test(error.message) ? 400 : 500;
      return res.status(status).json({ error: error.message });
    }
  };

  static setProducts = async (req, res) => {
    try {
      const products = req.body?.products;
      if (!Array.isArray(products)) {
        return res
          .status(400)
          .json({ error: "El body debe tener 'products' como array" });
      }
      const cart = await cartsService.setProducts(req.params.cid, products);
      return res.status(200).json(cart);
    } catch (error) {
      const status = /inválido|no encontrado/i.test(error.message) ? 400 : 500;
      return res.status(status).json({ error: error.message });
    }
  };

  static clear = async (req, res) => {
    try {
      const cart = await cartsService.clear(req.params.cid);
      return res.status(200).json(cart);
    } catch (error) {
      const status = /inválido|no encontrado/i.test(error.message) ? 400 : 500;
      return res.status(status).json({ error: error.message });
    }
  };

  // Nueva: compra del carrito → genera ticket, descuenta stock y deja fallidos en el carrito
  static purchase = async (req, res) => {
    try {
      const email = req.user?.email || "user@example.com";
      const ticket = await PurchaseService.purchaseCart(req.params.cid, email);
      return res.status(200).json({ ticket });
    } catch (error) {
      const msg = String(error.message || "");
      const status = /inválido|no encontrado/i.test(msg) ? 400 : 500;
      return res.status(status).json({ error: msg });
    }
  };

  // listar todos
  static getAllCarts = async (_req, res) => {
    try {
      const carts = await cartsService.getAll();
      return res.status(200).json(carts);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
}
