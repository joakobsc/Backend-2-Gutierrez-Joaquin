import "dotenv/config";

const cliPortArg = process.argv.find((a) => a.startsWith("--port="));
const cliPort = cliPortArg ? Number(cliPortArg.split("=")[1]) : null;

// Entorno
export const NODE_ENV = process.env.NODE_ENV || "development";

// Puerto
export const PORT = cliPort || Number(process.env.PORT) || 8080;

// Conexión a Mongo
export const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";

// JWT
export const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// Cookie
export const COOKIE_NAME = process.env.COOKIE_NAME || "tokenCookie";

//  Configuración SMTP (para reset password)
export const SMTP_HOST = process.env.SMTP_HOST || "smtp.ethereal.email";
export const SMTP_PORT = process.env.SMTP_PORT || "587";
export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASS = process.env.SMTP_PASS || "";

//  URL base de la app (para armar links en mails)
export const APP_BASE_URL =
  process.env.APP_BASE_URL || `http://localhost:${PORT}`;
