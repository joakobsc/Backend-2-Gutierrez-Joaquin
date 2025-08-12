import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: String,
    last_name: String,
    email: { type: String, unique: true },
    age: Number,
    password: String, // hash, no texto plano
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);
