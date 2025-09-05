// src/services/carts.service.js
import { CartsDAO } from "../dao/carts.dao.js";
import { ProductModel } from "../models/product.model.js";
import { CartsRepositoryMongo } from "../repositories/carts.repository.js";
import mongoose from "mongoose";

const cartsRepo = new CartsRepositoryMongo(CartsDAO);
const isObjectId = (id) =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

const normalizeProductsArray = (arr) => {
  if (!Array.isArray(arr)) return null;

  const normalized = arr.map((item) => {
    if (item == null || typeof item !== "object") return null;

    const productId = String(item.productId ?? item.product ?? item.pid ?? "");
    const qRaw = item.quantity ?? item.qty ?? 1;
    const qNum = Number(qRaw);
    const quantity = Number.isFinite(qNum) ? Math.floor(qNum) : NaN;

    if (!productId || !Number.isInteger(quantity) || quantity < 1) return null;
    return { productId, quantity };
  });

  if (normalized.some((x) => x === null)) return null;
  return normalized;
};

class CartsService {
  constructor(dao) {
    this.dao = dao;
  }

  async getCartById(cid) {
    if (!isObjectId(cid)) throw new Error("ID de carrito inválido");
    const cart = await this.dao.getById(cid);
    if (!cart) throw new Error("Carrito no encontrado");
    return cart;
  }

  async getAll() {
    return this.dao.getAll();
  }

  async createCart(userId) {
    if (userId && !isObjectId(userId))
      throw new Error("ID de usuario inválido");
    return this.dao.create(userId);
  }

  async addToCart(cid, pid, qty = 1) {
    if (!isObjectId(cid)) throw new Error("ID de carrito inválido");
    if (!isObjectId(pid)) throw new Error("ID de producto inválido");

    const qNum = Number(qty);
    const quantity = Number.isFinite(qNum) ? Math.floor(qNum) : NaN;
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Cantidad inválida (debe ser entero ≥ 1)");
    }

    const cart = await this.dao.getById(cid);
    if (!cart) throw new Error("Carrito no encontrado");

    const product = await ProductModel.findById(pid).lean();
    if (!product) throw new Error("Producto no encontrado");
    if (typeof product.stock !== "number") {
      throw new Error("Stock del producto inválido");
    }

    const currentItem = Array.isArray(cart.products)
      ? cart.products.find((p) => {
          const idInDoc =
            p.product?._id ?? p.product ?? p.productId?._id ?? p.productId;
          return String(idInDoc) === String(pid);
        })
      : null;

    const currentQty = currentItem?.quantity ?? 0;
    const totalRequested = currentQty + quantity;

    if (totalRequested > product.stock) {
      throw new Error(
        `Stock insuficiente: disponible ${product.stock}, solicitado ${totalRequested}`
      );
    }

    const updated = await this.dao.addProduct(cid, pid, quantity);
    if (!updated) throw new Error("Carrito no encontrado");
    return updated;
  }

  async removeFromCart(cid, pid) {
    if (!isObjectId(cid)) throw new Error("ID de carrito inválido");
    if (!isObjectId(pid)) throw new Error("ID de producto inválido");

    const updated = await this.dao.removeProduct(cid, pid);
    if (!updated) throw new Error("Carrito no encontrado");
    return updated;
  }

  async setProducts(cid, arr) {
    if (!isObjectId(cid)) throw new Error("ID de carrito inválido");

    const normalized = normalizeProductsArray(arr);
    if (!normalized) {
      throw new Error("El body debe incluir 'products' como array válido");
    }

    // Verificar existencia y stock de todos los productos
    const ids = [...new Set(normalized.map((i) => i.productId))];

    const invalidIds = ids.filter((id) => !isObjectId(id));
    if (invalidIds.length) {
      throw new Error(`IDs de producto inválidos: ${invalidIds.join(", ")}`);
    }

    const dbProducts = await ProductModel.find(
      { _id: { $in: ids } },
      { stock: 1 }
    ).lean();
    const foundMap = new Map(dbProducts.map((p) => [String(p._id), p]));

    const missing = ids.filter((id) => !foundMap.has(String(id)));
    if (missing.length) {
      throw new Error(`Productos no encontrados: ${missing.join(", ")}`);
    }

    for (const item of normalized) {
      const p = foundMap.get(String(item.productId));
      const stock = p?.stock ?? 0;
      if (item.quantity > stock) {
        throw new Error(
          `Stock insuficiente para ${item.productId}: disponible ${stock}, solicitado ${item.quantity}`
        );
      }
    }

    const updated = await this.dao.setProducts(cid, normalized);
    if (!updated) throw new Error("Carrito no encontrado");
    return updated;
  }

  async clear(cid) {
    if (!isObjectId(cid)) throw new Error("ID de carrito inválido");
    const updated = await this.dao.setProducts(cid, []); // vaciar
    if (!updated) throw new Error("Carrito no encontrado");
    return updated;
  }
}

export const cartsService = new CartsService(CartsDAO);
