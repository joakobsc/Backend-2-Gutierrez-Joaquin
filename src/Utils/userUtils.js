import { UserModel } from "../models/users.model.js";
import { hashPassword, comparePassword } from "./passwordUtils.js";

// Crear usuario con contraseña hasheada
export const createUser = async ({
  first_name,
  last_name,
  email,
  age,
  password,
}) => {
  const hashedPassword = await hashPassword(password);

  const newUser = new UserModel({
    first_name,
    last_name,
    email,
    age,
    password: hashedPassword,
    role: "user",
  });

  return newUser.save();
};

// Validar contraseña
export const isValidPassword = async (user, password) => {
  return comparePassword(password, user.password);
};
