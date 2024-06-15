import express, { Request, Response } from "express";
import {
  deleteCartItem,
  getAllCartItemsByUserId,
  getCartItem,
  insertCartItem,
  updateCartItem,
} from "../database/productCart";
import auth from "../middleware/auth";
const router = express.Router();

router.get("/:userId", auth, async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);

  console.log("====================================");
  console.log(userId);
  console.log("====================================");
  const cartItems = await getAllCartItemsByUserId(userId);

  res.send(cartItems);
});

router.post("/",  auth,async (req: Request, res: Response) => {
  const { productId, quantity, userId, colorName, colorValue } = req.body;

  console.log("===============req.body=====================");
  console.log(req.body);
  console.log("================req.body====================");

  const result = await insertCartItem(productId, quantity, userId, colorName, colorValue);

  res.status(201).send("Cart inserted Successfully!");
});

router.patch("/", auth, async (req: Request, res: Response) => {
  const { productId, quantity, userId, colorName, colorValue } = req.body;

  await updateCartItem(productId, quantity, colorName, colorValue, userId);

  res.status(202).send("Cart item updated Successfully!");
});

router.delete("/", auth, async (req: Request, res: Response) => {
  const { productId, userId, colorName, colorValue } = req.body;

  console.log("================delete === req.body====================");
  console.log(req.body);
  console.log("====================================");

  await deleteCartItem(productId, colorName, colorValue, userId);

  res.status(200).send("Cart delete updated Successfully!");
});

export default router;
