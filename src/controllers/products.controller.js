import { productsService } from "../services/products.service.js";

export class ProductsController {
  static getProducts = async (req, res) => {
    try {
      const result = await productsService.getProducts(req.query);
      return res.status(200).json({
        status: "success",
        payload: result.items,
        totalPages: result.totalPages,
        page: result.page,
        hasPrevPage: result.page > 1,
        hasNextPage: result.page < result.totalPages,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "internal server error" });
    }
  };

  static getProductById = async (req, res) => {
    try {
      const doc = await productsService.getProductById(req.params.pid);
      return res.status(200).json(doc);
    } catch (error) {
      const msg = String(error.message || "");
      const status = /no encontrado/i.test(msg)
        ? 404
        : /inválido/i.test(msg)
        ? 400
        : 500;
      return res.status(status).json({ error: msg });
    }
  };

  static createProduct = async (req, res) => {
    try {
      const { title, price } = req.body || {};

      if (!title || price == null) {
        return res.status(400).json({ error: "title y price son requeridos" });
      }
      const priceNum = Number(price);
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        return res.status(400).json({ error: "price debe ser un número > 0" });
      }

      const exist = await productsService.getProductByTitle(title);
      if (exist) {
        return res.status(400).json({ error: `Ya existe otro ${title} en DB` });
      }

      const producto = await productsService.createProduct({
        ...req.body,
        price: priceNum,
      });
      return res.status(201).json({ producto });
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "internal server error" });
    }
  };

  static updateProduct = async (req, res) => {
    try {
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, "price")) {
        const priceNum = Number(req.body.price);
        if (!Number.isFinite(priceNum) || priceNum <= 0) {
          return res
            .status(400)
            .json({ error: "price debe ser un número > 0" });
        }
        req.body.price = priceNum;
      }

      const updated = await productsService.updateProduct(
        req.params.pid,
        req.body
      );
      if (!updated)
        return res.status(404).json({ error: "Producto no encontrado" });
      return res.status(200).json({ producto: updated });
    } catch (error) {
      const msg = String(error.message || "");
      const status = /no encontrado/i.test(msg)
        ? 404
        : /inválido/i.test(msg)
        ? 400
        : 500;
      return res.status(status).json({ error: msg });
    }
  };

  static deleteProduct = async (req, res) => {
    try {
      const deleted = await productsService.deleteProduct(req.params.pid);
      if (!deleted)
        return res.status(404).json({ error: "Producto no encontrado" });
      return res.status(200).json({ ok: true });
    } catch (error) {
      const msg = String(error.message || "");
      const status = /no encontrado/i.test(msg)
        ? 404
        : /inválido/i.test(msg)
        ? 400
        : 500;
      return res.status(status).json({ error: msg });
    }
  };
}
