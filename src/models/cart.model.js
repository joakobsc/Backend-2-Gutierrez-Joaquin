import mongoose from "mongoose";
const cartCollection = "carts";

const cartSchema = new mongoose.Schema(
  {
    // Productos
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products", // referencia al modelo de productos
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: [1, "La cantidad mínima es 1"],
        },
        _id: false,
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // referencia al usuario
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const cartModel = new mongoose.model(cartCollection, cartSchema);
