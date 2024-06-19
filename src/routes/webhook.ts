import express, { Request, Response } from "express";
import Stripe from "stripe";
import { insertOrder, insertOrderItem } from "../database/orders";
import { string } from "zod";
import { log } from "console";

const router = express.Router();
const endpointSecret = `${process.env.ENDPOINT_SIGNIN_SECRETKEY}`;

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);

type ProductMetaData = {
  colorValue: string;
  colorName: string;
  productId: string;
};
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (request: Request, response: Response) => {
    const sig = request.headers["stripe-signature"] as string;

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;

        // Then define and call a function to handle the event payment_intent.succeeded
        break;

      case "checkout.session.completed":
        console.log(
          "===============checkout.session.completed====================="
        );
        console.log("checkout.session.completed");
        console.log(
          "================checkout.session.completed===================="
        );
        const session = event.data.object;
        const checkoutSession = await stripe.checkout.sessions.retrieve(
          session.id,
          {
            expand: ["line_items"],
          }
        );

        const lineItems = checkoutSession.line_items?.data;
        if (!lineItems) {
          console.error("No line items found for the session.");
          response.status(400).send("No line items found.");
          return;
        }
        const items = await Promise.all(
          lineItems?.map(async (item) => {
            let productMetadata: ProductMetaData = {
              colorValue: "",
              colorName: "",
              productId: "",
            };

            if (item.price?.product) {
              const product = await stripe.products.retrieve(
                item.price.product as string
              );
              productMetadata = product.metadata as unknown as ProductMetaData;
            }

            return {
              id: item.id,
              name: item.description,
              quantity: item.quantity,
              pricePerItem: item.price?.unit_amount,
              total: item.amount_total,
              productId: item.price?.product,
              metadata: productMetadata,
            };
          })
        );

        console.log("===============insertOrder=====================");

        const orderId = await insertOrder(
          parseInt(session.metadata?.userId!),
          (session.amount_total || 0) / 100,
          (checkoutSession.total_details?.amount_discount || 0) / 100
        );
        console.log("orderId == ", orderId);
        console.log("===============insertOrder=====================");

        const orderItem = items?.map(async (item) => {
          return insertOrderItem(
            orderId,
            parseInt(item.metadata.productId),
            item.metadata.colorName,
            item.metadata.colorValue,
            item.quantity!,
            item.pricePerItem! / 100,
            0,
            item.total / 100
          );
        });

        if (orderItem) {
          await Promise.all(orderItem);
        }

        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

export default router;
