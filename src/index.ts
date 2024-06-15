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
import cors from "cors";
import webhook from "./routes/webhook";
import orders from "./routes/orders";
import address from "./routes/address";

const app = express();
// allow localhost to recieve data
// const allowedOrigins = ["http://localhost:5173"];
app.use(cors({
  origin: 'https://666dfa17633cce3259169534--leafy-bubblegum-60b994.netlify.app'
}));

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
app.use(helmet());
app.use(compression());

// catch error
app.use(error);

const PORT = 3000;
app.listen(PORT, () => {
  logger.log("info", `Running on port ${PORT}`);
});