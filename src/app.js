import express from "express";
import productsRouter from "./routes/products.router.js";
import sessionRouter from "./routes/session.router.js";
import cartsRouter from "./routes/carts.router.js";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import viewRouter from "./routes/views.router.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { initializePassport } from "./middlewares/passport.js";

const app = express();
const PORT = 8080;
const DB =
  "mongodb+srv://JoacoBSC:vODoUPdzpgxYFwsS@cluster0.pklyw.mongodb.net/e-commerce?retryWrites=true&w=majority&appName=Cluster0";

// Conexión a Mongo
const connectMongoDB = async () => {
  try {
    await mongoose.connect(DB);
    console.log("Conectado a la base de datos");
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    process.exit(1);
  }
};
connectMongoDB();

// Middlewares Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.use(initializePassport());

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
app.use("/api/cart", cartsRouter);
app.use("/api/sessions", sessionRouter);

// Iniciar HTTP server
const httpServer = app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
