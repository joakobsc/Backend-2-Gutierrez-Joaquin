import mongoose from "mongoose";
const productsCollection = "products";

const productsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    required: true,
  },

  thumbnail: {
    type: String,
  },
});

export const productsModel = mongoose.model(productsCollection, productsSchema);
