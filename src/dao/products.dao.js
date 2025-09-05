import mongoose from "mongoose";
import { productsModel } from "../models/product.model.js";

const isId = (id) => mongoose.Types.ObjectId.isValid(id);

const toNumber = (v, def) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export class ProductsDAO {
  static async get({ limit = 10, page = 1, sort, query } = {}) {
    const limitN = Math.max(1, toNumber(limit, 10));
    const pageN = Math.max(1, toNumber(page, 1));
    const skip = (pageN - 1) * limitN;

    const filter = {};
    if (query) {
      const q = String(query).trim();
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }

    const sortOpt =
      sort === "asc"
        ? { price: 1 }
        : sort === "desc"
        ? { price: -1 }
        : { createdAt: -1 };

    const [items, total] = await Promise.all([
      productsModel.find(filter).sort(sortOpt).skip(skip).limit(limitN).lean(),
      productsModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page: pageN,
      limit: limitN,
      sort: sort || "created_desc",
      totalPages: Math.max(1, Math.ceil(total / limitN)),
    };
  }

  static async getById(pid) {
    if (!isId(pid)) throw new Error("ID inválido");
    const doc = await productsModel.findById(pid).lean();
    if (!doc) throw new Error("Producto no encontrado");
    return doc;
  }

  static getByTitle(title) {
    if (!title) return null;
    return productsModel.findOne({ title: String(title).trim() }).lean();
  }

  static async create(data) {
    const created = await productsModel.create(data);
    return productsModel.findById(created._id).lean();
  }

  static async update(pid, data) {
    if (!isId(pid)) throw new Error("ID inválido");
    return productsModel.findByIdAndUpdate(pid, data, { new: true }).lean();
  }

  static async delete(pid) {
    if (!isId(pid)) throw new Error("ID inválido");
    return productsModel.findByIdAndDelete(pid).lean();
  }
}
