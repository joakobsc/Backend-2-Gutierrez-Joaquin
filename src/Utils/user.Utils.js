import { UserModel } from "../models/users.model.js";
import { hashPassword } from "./passwordUtils.js";

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
  });

  return newUser.save();
};
