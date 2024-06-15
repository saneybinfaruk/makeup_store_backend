import express, { Request, Response } from "express";
import {
  deleteAddressById,
  getAddressById,
  getAllAddressesByUserId,
  getSelectedAddress,
  insertAddress,
  setAddressType,
  updateAddressById,
} from "../database/address";
import auth from "../middleware/auth";
const router = express.Router();

router.get("/", auth, async (req: Request, res: Response) => {
  const query = req.query;

  console.log("================query====================");
  console.log(query);

  console.log("====================================");

  const getAllAddresses = await getAddressById(
    parseInt(query.userId as string),
    parseInt(query.address_id as string)
  );

  res.send(getAllAddresses);
});

router.get("/:userId", auth, async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);

  console.log("====================================");
  console.log(userId);
  console.log("====================================");

  const getAllAddresses = await getSelectedAddress(userId);
  res.send(getAllAddresses);
});

router.get("/all/:userId", auth, async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);

  console.log("====================================");
  console.log(userId);
  console.log("====================================");

  const getAllAddresses = await getAllAddressesByUserId(userId);
  res.send(getAllAddresses);
});

router.post("/", auth, async (req: Request, res: Response) => {
  const address = req.body;

  const a = await insertAddress(
    address.userId,
    address.address_line,
    address.city,
    address.state,
    address.zip,
    address.country
  );

  res.send(a);
});

router.patch("/typeupdate", auth, async (req: Request, res: Response) => {
  const address = req.body;

  console.log("====================================");
  console.log(address);
  console.log("====================================");

  const a = await setAddressType(
    address.userId,
    address.address_id,
    address.type
  );

  res.send();
});

router.delete("/delete", auth, async (req: Request, res: Response) => {
  const address = req.body;

  await deleteAddressById(address.userId, address.address_id);

  res.send();
});

router.patch("/update", auth, async (req: Request, res: Response) => {
  const address = req.body;
  const { address_line, city, state, zip, country, userId, address_id } =
    address;

  console.log("====================================");
  console.log(address);
  console.log("====================================");

  const a = await updateAddressById(
    address_line,
    city,
    state,
    zip,
    country,
    userId,
    address_id
  );

  res.send(a);
});

export default router;
