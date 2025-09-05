import { CartsRepositoryMongo } from "../repositories/carts.repository.js";
import { ProductsRepositoryMongo } from "../repositories/products.repository.js";
import { TicketsRepositoryMongo } from "../repositories/tickets.repository.js";

import { CartsDAO } from "../dao/carts.dao.js";
import { ProductsDAO } from "../dao/products.dao.js";
import { TicketModel } from "../models/ticket.model.js";

const cartsRepo = new CartsRepositoryMongo(CartsDAO);
const productsRepo = new ProductsRepositoryMongo(ProductsDAO);
const ticketsRepo = new TicketsRepositoryMongo(TicketModel);

export class PurchaseService {
  static async purchaseCart(cid, purchaserEmail) {
    // 1) Traer carrito
    const cart = await cartsRepo.getById(cid);
    if (!cart) throw new Error("Carrito no encontrado");

    const itemsOK = [];
    const itemsFail = [];

    // 2) Evaluar stock para cada item
    for (const it of cart.products || []) {
      const prodId = it.productId?._id || it.productId;
      const qty = Number(it.quantity) || 0;
      if (!prodId || qty < 1) continue;

      const db = await productsRepo.getById(String(prodId));
      if (!db) {
        itemsFail.push({ productId: prodId, requested: qty, available: 0 });
        continue;
      }

      if (db.stock >= qty) {
        // Descontar stock
        await productsRepo.update(String(prodId), { stock: db.stock - qty });
        itemsOK.push({
          productId: prodId,
          quantity: qty,
          price: Number(db.price),
        });
      } else {
        itemsFail.push({
          productId: prodId,
          requested: qty,
          available: db.stock,
        });
      }
    }

    // 3) Calcular total y crear ticket
    const amount = itemsOK.reduce((acc, x) => acc + x.quantity * x.price, 0);
    const code = `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const ticket = await ticketsRepo.create({
      code,
      amount,
      purchaser: String(purchaserEmail || "").toLowerCase(),
      itemsOK,
      itemsFail,
    });

    await cartsRepo.setProducts(
      cid,
      itemsFail.map((f) => ({ productId: f.productId, quantity: f.requested }))
    );

    return ticket;
  }
}
