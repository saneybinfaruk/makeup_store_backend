"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const users_1 = __importDefault(require("./routes/users"));
const auth_1 = __importDefault(require("./routes/auth"));
const error_1 = __importDefault(require("./middleware/error"));
const loggin_1 = __importDefault(require("./utility/loggin"));
const check_key_1 = __importDefault(require("./startup/check-key"));
const products_1 = __importDefault(require("./routes/products"));
// import cors from "./middleware/cors";
const payment_1 = __importDefault(require("./routes/payment"));
const productCart_1 = __importDefault(require("./routes/productCart"));
const webhook_1 = __importDefault(require("./routes/webhook"));
const orders_1 = __importDefault(require("./routes/orders"));
const address_1 = __importDefault(require("./routes/address"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// List of allowed origins
// const allowedOrigins = ['https://jamboramakeupstore.netlify.app/'];
// // Use CORS middleware
// app.use(cors(allowedOrigins));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use("/api/create-checkout-session/webhook", webhook_1.default);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// check JwtPrivate key set or not, if not set on env file app crash
(0, check_key_1.default)();
app.use("/api/users", users_1.default);
app.use("/api/auth", auth_1.default);
app.use("/api/products", products_1.default);
app.use("/api/create-checkout-session", payment_1.default);
app.use("/api/carts", productCart_1.default);
app.use("/api/orders", orders_1.default);
app.use("/api/address", address_1.default);
// catch error
app.use(error_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  loggin_1.default.log("info", `Running on port ${PORT}`);
});
