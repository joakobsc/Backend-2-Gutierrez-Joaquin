import mongoose from "mongoose";
import { cartModel } from "../models/cart.model.js";

const isId = (id) => mongoose.Types.ObjectId.isValid(id);
const oid = (id) => new mongoose.Types.ObjectId(id);

export class CartsDAO {
  static async create(userId) {
    const payload = { products: [] };
    if (userId && isId(userId)) payload.user = oid(userId);
    const created = await cartModel.create(payload);
    return cartModel
      .findById(created._id)
      .populate({
        path: "products.productId",
        select: "title price stock category",
      })
      .lean();
  }

  static getAll() {
    return cartModel
      .find()
      .populate({
        path: "products.productId",
        select: "title price stock category",
      })
      .lean();
  }

  static async getById(cid) {
    if (!isId(cid)) throw new Error("ID de carrito inválido");
    const cart = await cartModel
      .findById(cid)
      .populate({
        path: "products.productId",
        select: "title price stock category",
      })
      .lean();
    if (!cart) throw new Error("Carrito no encontrado");
    return cart;
  }

  static async addProduct(cid, pid, qty = 1) {
    if (!isId(cid) || !isId(pid)) throw new Error("ID inválido");

    const inc = await cartModel.findOneAndUpdate(
      { _id: oid(cid), "products.productId": oid(pid) },
      { $inc: { "products.$.quantity": qty } },
      { new: true }
    );

    if (inc) {
      return inc
        .populate({
          path: "products.productId",
          select: "title price stock category",
        })
        .lean();
    }

    const pushed = await cartModel.findByIdAndUpdate(
      oid(cid),
      { $push: { products: { productId: oid(pid), quantity: qty } } },
      { new: true }
    );

    if (!pushed) throw new Error("Carrito no encontrado");

    return pushed
      .populate({
        path: "products.productId",
        select: "title price stock category",
      })
      .lean();
  }

  static async removeProduct(cid, pid) {
    if (!isId(cid) || !isId(pid)) throw new Error("ID inválido");

    const updated = await cartModel.findByIdAndUpdate(
      oid(cid),
      { $pull: { products: { productId: oid(pid) } } },
      { new: true }
    );

    if (!updated) throw new Error("Carrito no encontrado");

    return updated
      .populate({
        path: "products.productId",
        select: "title price stock category",
      })
      .lean();
  }

  static async setProducts(cid, productsArray) {
    if (!isId(cid)) throw new Error("ID inválido");
    if (!Array.isArray(productsArray))
      throw new Error("El arreglo de productos es inválido");

    const normalized = productsArray.map((i) => ({
      productId: oid(i.productId || i.pid),
      quantity: Number.isFinite(Number(i.quantity ?? i.qty))
        ? Math.floor(Number(i.quantity ?? i.qty))
        : 1,
    }));

    const updated = await cartModel.findByIdAndUpdate(
      oid(cid),
      { $set: { products: normalized } },
      { new: true }
    );

    if (!updated) throw new Error("Carrito no encontrado");

    return updated
      .populate({
        path: "products.productId",
        select: "title price stock category",
      })
      .lean();
  }

  static async clear(cid) {
    if (!isId(cid)) throw new Error("ID inválido");

    const updated = await cartModel.findByIdAndUpdate(
      oid(cid),
      { $set: { products: [] } },
      { new: true }
    );

    if (!updated) throw new Error("Carrito no encontrado");

    return updated
      .populate({
        path: "products.productId",
        select: "title price stock category",
      })
      .lean();
  }
}
