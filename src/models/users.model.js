import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: String,
    last_name: String,
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Por favor ingresa un email válido"],
    },
    age: Number,
    password: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "carts",
      default: null, // inicialmente sin carrito
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);
