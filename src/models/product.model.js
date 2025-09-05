import mongoose from "mongoose";
const productsCollection = "products";

const productsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0.01, "El precio debe ser > 0"],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "El stock no puede ser negativo"],
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    thumbnail: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const productsModel = mongoose.model(productsCollection, productsSchema);

export const ProductModel = productsModel;
