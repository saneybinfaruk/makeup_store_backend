import express, { Request, Response } from "express";
import { getOrdersByUserId } from "../database/orders";
import auth from "../middleware/auth";

const router = express.Router();

router.get("/",auth, async (req: Request, res: Response) => {
  const userId = req.body.userId;
  // const result = await getOrdersByUserId(userId);

  console.log("====================================");
  console.log(userId);
  console.log("====================================");

  res.send();
});
router.get("/:userId", auth, async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await getOrdersByUserId(parseInt(userId));

  res.send(result);
});

export default router;
