import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, trim: true },
    last_name: { type: String, trim: true },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Por favor ingresa un email válido"],
    },
    age: { type: Number, min: 0 },
    password: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "carts",
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

export const UserModel = mongoose.model("User", userSchema);
