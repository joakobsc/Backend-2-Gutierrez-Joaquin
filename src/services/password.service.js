import crypto from "crypto";
import { UserModel } from "../models/users.model.js";
import { PasswordResetModel } from "../models/passwordReset.model.js";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";

export class PasswordService {
  static async request(email) {
    if (!email) return;
    const user = await UserModel.findOne({
      email: String(email).toLowerCase().trim(),
    })
      .select("+password")
      .lean();
    if (!user) return; // no revelar si existe o no

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await PasswordResetModel.deleteMany({ userId: user._id }); // invalida anteriores
    await PasswordResetModel.create({ userId: user._id, token, expiresAt });

    return { token, userEmail: user.email };
  }

  static async reset(token, newPassword) {
    if (!token || !newPassword) throw new Error("Datos inválidos");

    const rec = await PasswordResetModel.findOne({ token }).lean();
    if (!rec) throw new Error("Token inválido");
    if (rec.expiresAt < new Date()) {
      await PasswordResetModel.deleteOne({ _id: rec._id });
      throw new Error("Token expirado");
    }

    const user = await UserModel.findById(rec.userId).select("+password");
    if (!user) {
      await PasswordResetModel.deleteOne({ _id: rec._id });
      throw new Error("Usuario no encontrado");
    }

    // no permitir misma contraseña
    const same = await comparePassword(newPassword, user.password);
    if (same)
      throw new Error("La nueva contraseña no puede ser igual a la anterior");

    const hashed = await hashPassword(newPassword);
    await UserModel.findByIdAndUpdate(user._id, { password: hashed });

    await PasswordResetModel.deleteOne({ _id: rec._id }); // invalida token usado
    return true;
  }
}
