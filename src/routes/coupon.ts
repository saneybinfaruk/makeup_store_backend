import express, { Request, Response } from "express";
import Stripe from "stripe";
import env from "dotenv";
import { request } from "http";

env.config();

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);
const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { code } = req.body;
  try {
    const coupons = await stripe.coupons.list({ limit: 10 });
    const coupon = coupons.data.find((coupon) => coupon.name === code);
    if (!coupon) return res.send("Nothing found!").status(404);
    res.send(coupon?.percent_off?.toString()).status(200);
  } catch (error) {
    res.send(error).status(400);
  }
});

export default router;
