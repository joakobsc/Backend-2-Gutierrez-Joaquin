import { ProductsDAO } from "../dao/products.dao.js";
import { ProductsRepositoryMongo } from "../repositories/products.repository.js";
import mongoose from "mongoose";

const productsRepo = new ProductsRepositoryMongo(ProductsDAO);
const isObjectId = (id) =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

class ProductsService {
  constructor(dao) {
    this.dao = dao;
  }

  // Listado con filtros/paginación
  async getProducts(opts) {
    return this.dao.get(opts);
  }

  // Buscar por id
  async getProductById(id) {
    if (!isObjectId(id)) throw new Error("ID inválido");
    const doc = await this.dao.getById(id);
    if (!doc) throw new Error("Producto no encontrado");
    return doc;
  }

  // Buscar por título exacto
  async getProductByTitle(title) {
    if (!title || typeof title !== "string") {
      throw new Error("Título inválido");
    }
    return this.dao.getByTitle(title.trim());
  }

  // Crear producto
  async createProduct(data) {
    const { title, price, stock } = data || {};

    if (!title || typeof title !== "string") {
      throw new Error("Título inválido");
    }

    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      throw new Error("Precio inválido");
    }

    const stockNum = Number(stock ?? 0);
    if (!Number.isFinite(stockNum) || stockNum < 0) {
      throw new Error("Stock inválido");
    }

    return this.dao.create({
      ...data,
      title: title.trim(),
      price: priceNum,
      stock: stockNum,
    });
  }

  // Actualizar producto
  async updateProduct(id, data) {
    if (!isObjectId(id)) throw new Error("ID inválido");

    const update = {};
    if (data.title !== undefined) {
      if (!data.title || typeof data.title !== "string")
        throw new Error("Título inválido");
      update.title = data.title.trim();
    }
    if (data.price !== undefined) {
      const priceNum = Number(data.price);
      if (!Number.isFinite(priceNum) || priceNum <= 0)
        throw new Error("Precio inválido");
      update.price = priceNum;
    }
    if (data.stock !== undefined) {
      const stockNum = Number(data.stock);
      if (!Number.isFinite(stockNum) || stockNum < 0)
        throw new Error("Stock inválido");
      update.stock = stockNum;
    }

    const updated = await this.dao.update(id, update);
    if (!updated) throw new Error("Producto no encontrado");
    return updated;
  }

  // Eliminar producto
  async deleteProduct(id) {
    if (!isObjectId(id)) throw new Error("ID inválido");
    const deleted = await this.dao.delete(id);
    if (!deleted) throw new Error("Producto no encontrado");
    return deleted;
  }
}

export const productsService = new ProductsService(ProductsDAO);
