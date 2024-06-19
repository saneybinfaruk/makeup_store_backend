import express, { Request, Response } from "express";
import Stripe from "stripe";
import env from "dotenv";
import { getProductByIds } from "../database/products";
import { Coupon, getCouponDetails } from "../database/coupons";
import { assert } from "console";

env.config();

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send(`${process.env.STRIPE_PUBLISHABLE_KEY}`);
});

// router.post("/", async (req: Request, res: Response) => {
//   const paymentIntent = await stripe.paymentIntents.create({
//     currency: "usd",
//     amount: 100 * 1000,
//     automatic_payment_methods: {
//       enabled: true,
//     },
//   });

//   res.send(paymentIntent.client_secret);
// });

export interface CartInfoSendToBackend {
  userId: number;
  productId: number;
  colorName: string;
  colorValue: string;
  quantity: number;
  discountAmount: number;
  couponCode: string;
}

router.post("/", async (req: Request, res: Response) => {
  console.log("================Got it====================");

  const items = req.body as CartInfoSendToBackend[];

  const coupon = items.map((i) => i.couponCode)[0];

  const userId = items.map((u) => u.userId)[0];

  const ids = items.map((i) => i.productId);

  const [result] = await getProductByIds(ids);

  console.log("====================================");
  console.log(items);
  console.log("====================================");

  const productDetails = (id: number) =>
    items.filter((i, index) => index === id)[0];

  let discount = [];
  if (coupon) {
    const coupons = await stripe.coupons.list({ limit: 100 });

    const copon = coupons.data.find((c) => c.name === coupon);

    if (copon) {
      discount.push({ coupon: copon.id });
    }
  }
  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ["card"],
  //   // line_items: result.reverse().map((product) => {
  //   //   const itemQuantity = productDetails(product.product_id).quantity;
  //   //   const cName = productDetails(product.product_id).colorName;
  //   //   const cValue = productDetails(product.product_id).colorValue;

  //   //   return {
  //   //     price_data: {
  //   //       currency: "usd",
  //   //       product_data: {
  //   //         name: product.name.trim(),
  //   //         images: [`http:${product.api_featured_image!}`],
  //   //         metadata: {
  //   //           productId: product.product_id,
  //   //           colorName: cName,
  //   //           colorValue: cValue,
  //   //         },
  //   //       },
  //   //       unit_amount: ((product.price ? product.price : 0) as number) * 100,
  //   //     },

  //   //     quantity: itemQuantity,
  //   //   };
  //   // }),
  //   line_items: ids.map((id) => {
  //     const products = result.filter((p) => p.product_id === id);

  //     products.map((product) => {
  //       const itemQuantity = productDetails(product.product_id).quantity;
  //       const cName = productDetails(product.product_id).colorName;
  //       const cValue = productDetails(product.product_id).colorValue;

  //       return {
  //         price_data: {
  //           currency: "usd",
  //           product_data: {
  //             name: product.name.trim(),
  //             images: [`http:${product.api_featured_image!}`],
  //             metadata: {
  //               productId: product.product_id,
  //               colorName: cName,
  //               colorValue: cValue,
  //             },
  //           },
  //           unit_amount: ((product.price ? product.price : 0) as number) * 100,
  //         },

  //         quantity: itemQuantity,
  //       };
  //     });
  //   }),
  //   mode: "payment",
  //   discounts: discount,
  //   success_url: `${process.env.URL}me`,
  //   cancel_url: `${process.env.URL}cartPage`,
  //   metadata: {
  //     userId: userId,
  //   },
  // });
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: ids.flatMap((id, index) => {
      // Get all products with the matching product_id
      const products = result.filter((p) => p.product_id === id);

      // Transform each product into the required format for Stripe
      return products.map((product) => {
        // Get product details
        const {
          quantity: itemQuantity,
          colorName: cName,
          colorValue: cValue,
        } = productDetails(index);

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name.trim(),
              images: [`http:${product.api_featured_image!}`],
              metadata: {
                productId: product.product_id,
                colorName: cName,
                colorValue: cValue,
              },
            },
            unit_amount:
              parseFloat((product.price ? product.price : 0).toString()) * 100,
          },
          quantity: itemQuantity,
        };
      });
    }),
    mode: "payment",
    discounts: discount,
    success_url: `${process.env.URL}me/orders?payment_status=success`,
    cancel_url: `${process.env.URL}checkout`,
    metadata: {
      userId: userId,
    },
  });

  
  res.send(session.id);
});
const endpointSecret =
  "whsec_838da01868ad20da061f55dc754e64019bae4d57832c83deb3f0acf45259efc9";

// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   (request: Request, response: Response) => {
//     const sig = request.headers["stripe-signature"] as string;

//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
//       console.log("==============Webhook Event======================");
//       console.log("Webhook Event == ", event);
//       console.log("====================================");
//     } catch (err) {
//       console.log("==============Webhook err======================");
//       console.log("Webhook err == ", err);
//       console.log("====================================");
//       response.status(400).send(`Webhook Error: ${err}`);
//       return;
//     }

//     // Handle the event
//     switch (event.type) {
//       case "payment_intent.succeeded":
//         const paymentIntentSucceeded = event.data.object;
//         console.log('===============paymentIntentSucceeded=====================');
//         console.log(paymentIntentSucceeded);
//         console.log('====================================');
//         // Then define and call a function to handle the event payment_intent.succeeded
//         break;
//       // ... handle other event types
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     // Return a 200 response to acknowledge receipt of the event
//     response.send();
//   }
// );

export default router;
