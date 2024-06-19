import "express-async-errors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import compression from "compression";
import users from "./routes/users";
import auth from "./routes/auth";
import error from "./middleware/error";
import logger from "./utility/loggin";
import checkJwtPrivateKey from "./startup/check-key";
import products from "./routes/products";
// import cors from "./middleware/cors";
import payment from "./routes/payment";
import productCart from "./routes/productCart";
import webhook from "./routes/webhook";
import orders from "./routes/orders";
import address from "./routes/address";
import cors from "cors";

const app = express();

// List of allowed origins
// const allowedOrigins = ['https://jamboramakeupstore.netlify.app/'];

// // Use CORS middleware
// app.use(cors(allowedOrigins));

app.use(cors());

app.use(helmet());
app.use(compression());

app.use("/api/create-checkout-session/webhook", webhook);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// check JwtPrivate key set or not, if not set on env file app crash
checkJwtPrivateKey();

app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/products", products);
app.use("/api/create-checkout-session", payment);
app.use("/api/carts", productCart);
app.use("/api/orders", orders);
app.use("/api/address", address);

// catch error
app.use(error);

const PORT = 3000;
app.listen(PORT, () => {
  logger.log("info", `Running on port ${PORT}`);
});
