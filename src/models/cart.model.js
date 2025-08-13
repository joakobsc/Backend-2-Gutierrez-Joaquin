import mongoose from "mongoose";
const cartCollection = "carts";

const cartSchema = new mongoose.Schema({
  // Productos
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products", // Referencia al producto
        required: true,
      },
      // Cantidad
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      _id: false,
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", //referencia al usuario
    required: true,
    unique: true,
  },
});

export const cartModel = new mongoose.model(cartCollection, cartSchema);
