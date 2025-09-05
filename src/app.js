import express from "express";
import productsRouter from "./routes/products.router.js";
import sessionRouter from "./routes/session.router.js";
import cartsRouter from "./routes/carts.router.js";
import passwordRouter from "./routes/password.router.js"; //  reset password
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import viewRouter from "./routes/views.router.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { initializePassport } from "./middlewares/passport.js";
import cors from "cors";
import { PORT, MONGO_URI } from "./config/env.js";

const app = express();

// DB
(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Conectado a la base de datos");
  } catch (error) {
    console.error(
      "Error al conectar a la base de datos:",
      error?.message || error
    );
    process.exit(1);
  }
})();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(initializePassport());
app.use(cors());
app.use(express.static(__dirname + "/public"));

// Handlebars
app.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: "main",
    helpers: {
      gt: (a, b) => a > b,
      lt: (a, b) => a < b,
      add: (a, b) => a + b,
      subtract: (a, b) => a - b,
    },
    allowProtoPropertiesByDefault: true,
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

// Rutas
app.use("/", viewRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/password", passwordRouter); // ⬅️ recupero de contraseña

// Server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
