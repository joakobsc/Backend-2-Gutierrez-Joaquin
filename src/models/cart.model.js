import mongoose from "mongoose";
const cartCollection = "carts";

const cartSchema = new mongoose.Schema({
  // Productos que contiene el carrito
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products", // Referencia al producto
        required: true,
      },
      // Cantidad de cada producto en el carrito
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      _id: false,
    },
  ],
});

export const cartModel = new mongoose.model(cartCollection, cartSchema);
