import express, { Request, Response } from "express";
import {
  getOrdersByUserId,
  insertOrder,
  insertOrderItem,
} from "../database/orders";
import auth from "../middleware/auth";
import { UsersProductCart } from "../entities/types";

const router = express.Router();

router.get("/", auth, async (req: Request, res: Response) => {
  const userId = req.body.userId;
  // const result = await getOrdersByUserId(userId);

  console.log("====================================");
  console.log(userId);
  console.log("====================================");

  res.send();
});

router.post("/", auth, async (req: Request, res: Response) => {
  const body = req.body as UsersProductCart;

  const userId = body.userId;
  const discount = body.discount;
  const cartList = body.cartList;

  const deliveryFees = 6;

  const price = cartList.reduce(
    (total, currentItem) =>
      total + parseFloat(currentItem.product.price!) * currentItem.quantity,
    0
  );

  const totalPrice = price - (price * discount) / 100 + deliveryFees;

  const orderId = await insertOrder(userId, totalPrice, discount);

  const items = cartList.map(async (cartItem) =>
    insertOrderItem(
      orderId,
      cartItem.product.product_id,
      cartItem.color.color_name,
      cartItem.color.value,
      cartItem.quantity,
      parseInt(cartItem.product.price!),
      discount,
      parseInt(cartItem.product.price!) * cartItem.quantity
    )
  );

  if (items) {
    console.log(items)
    await Promise.all(items);
  }

  res.send();
});

router.get("/:userId", auth, async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await getOrdersByUserId(parseInt(userId));

  res.send(result);
});

export default router;
