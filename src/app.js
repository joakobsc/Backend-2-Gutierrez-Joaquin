import express from "express";
import productsRouter from "./routes/products.router.js";
import sessionRouter from "./routes/session.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import viewRouter from "./routes/views.router.js";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { cartModel } from "./models/cart.model.js";
import session from "express-session";

const app = express();
const PORT = 8080;
const DB =
  "mongodb+srv://JoacoBSC:vODoUPdzpgxYFwsS@cluster0.pklyw.mongodb.net/e-commerce?retryWrites=true&w=majority&appName=Cluster0";

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

// Inicializa la sesión

app.use(
  session({
    secret: "admin123",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// Configuramos Handlebars como motor de plantillas
app.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: "main",
    helpers: {
      gt: (a, b) => a > b, // Define el helper `gt`
      lt: (a, b) => a < b, // Define el helper `lt`
      add: (a, b) => a + b, // Define el helper `add`
      subtract: (a, b) => a - b, // Define el helper `subtract`
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

// Rutas de vista
app.use("/", viewRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartsRouter);
app.use("/api/sessions", sessionRouter);

//usuarios

app.get("/get-session-user", (req, res) => {
  const user = req.session.user;
  res.json({ user });
});

app.post("/set-session-user", express.json(), (req, res) => {
  const { user } = req.body;
  if (!user || user.trim() === "") {
    return res.status(400).send("Usuario necesario");
  }
  req.session.user = user;
  res.status(200).send("Usuario guardado en sesión");
});

// Iniciar el servidor HTTP
const httpServer = app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});

// Nueva instancia de Socket.io
const socketServer = new Server(httpServer);

/* =============================================================================
              AHORA:
Utilizamos socket para poder comunicarnos con el cliente 
desde el servidor, sin necesidad de hacer solicitudes HTTP convencionales
y hacer un procesamiento en tiempo real

===========================================================================*/

socketServer.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado");

  socket.on("userConnected", ({ user }) => {
    console.log(`${user} se ha conectado`);
  });
  // Escuchar el evento 'addToCart'
  socket.on("addToCart", async ({ productId, cartId }) => {
    try {
      // Buscar el carrito en la base de datos
      const cart = await cartModel.findById(cartId);
      if (cart) {
        // Verifica si el producto ya está en el carrito
        const productIndex = cart.products.findIndex(
          (product) => product.productId.toString() === productId
        );

        if (productIndex === -1) {
          // Agregar el producto al carrito si no existe
          cart.products.push({ productId, quantity: 1 });
        } else {
          // Incrementa la cantidad si ya existe
          cart.products[productIndex].quantity += 1;
        }

        await cart.save();

        // Emitir mensaje de éxito al cliente
        socket.emit("cartUpdated", {
          message: "Producto agregado exitosamente",
        });
      } else {
        throw new Error("Carrito no encontrado");
      }
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      socket.emit("error", { message: "No se pudo agregar al carrito" });
    }
  });
});
