import passport from "passport";
import local from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { createUser } from "../utils/userUtils.js";
import { UserModel } from "../models/users.model.js";
import { comparePassword } from "../utils/passwordUtils.js";
import { JWT_SECRET, COOKIE_NAME } from "./env.js"; // 🔹 import de env.js

const LocalStrategy = local.Strategy;

// REGISTER
passport.use(
  "register",
  new LocalStrategy(
    {
      usernameField: "email",
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

// LOGIN
passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Usuario no encontrado" });
        }

        const validPassword = await comparePassword(password, user.password);
        if (!validPassword) {
          return done(null, false, { message: "Contraseña incorrecta" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// CURRENT con JWT
passport.use(
  "current",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies[COOKIE_NAME]; // 🔹 ahora viene de env
          }
          return token;
        },
      ]),
      secretOrKey: JWT_SECRET, // 🔹 ahora viene de env
    },
    async (jwtPayload, done) => {
      try {
        const user = await UserModel.findById(jwtPayload.id);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
