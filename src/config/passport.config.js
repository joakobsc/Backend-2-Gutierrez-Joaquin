import passport from "passport";
import local from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { createUser } from "../utils/userUtils.js";
import { UserModel } from "../models/users.model.js";
import { comparePassword } from "../utils/passwordUtils.js";
import { JWT_SECRET, COOKIE_NAME } from "./env.js";

const LocalStrategy = local.Strategy;

// REGISTER (Local)
passport.use(
  "register",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const { first_name, last_name, age } = req.body;

        if (!first_name || !last_name || !email || !password) {
          return done(null, false, {
            message: "Todos los campos son obligatorios",
          });
        }

        const userExists = await UserModel.findOne({ email });
        if (userExists) {
          return done(null, false, {
            message: "El usuario ya está registrado",
          });
        }

        const newUser = await createUser({
          first_name,
          last_name,
          email,
          age,
          password,
        });

        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// LOGIN (Local)
passport.use(
  "login",
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({ email });
        if (!user)
          return done(null, false, { message: "Usuario no encontrado" });

        const validPassword = await comparePassword(password, user.password);
        if (!validPassword)
          return done(null, false, { message: "Contraseña incorrecta" });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// CURRENT (JWT por cookie)
passport.use(
  "current",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => (req?.cookies ? req.cookies[COOKIE_NAME] : null),
      ]),
      secretOrKey: JWT_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        // 👇 tu token firma _id, no id
        const userId = jwtPayload._id || jwtPayload.id;
        const user = await UserModel.findById(userId);
        if (!user) return done(null, false);
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
