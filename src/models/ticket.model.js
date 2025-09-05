import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    purchaser: { type: String, required: true, lowercase: true, trim: true },
    itemsOK: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "products",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        _id: false,
      },
    ],
    itemsFail: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "products",
          required: true,
        },
        requested: { type: Number, required: true, min: 1 },
        available: { type: Number, required: true, min: 0 },
        _id: false,
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export const TicketModel = mongoose.model("tickets", ticketSchema);
