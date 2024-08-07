import express, { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  createUser,
  getUser,
  getUserByEmail,
  getUsers,
} from "../database/users";
import z, { number, string } from "zod";
import generateAuthToken from "../utility/token";
import auth, { CustomRequest } from "../middleware/auth";
import admin from "../middleware/admin";
import { User } from "../entities/User";

const router = express.Router();

const registerSchema = z.object({
  firstName: string().min(4, {
    message: "First name needs at least 4 characters.",
  }),
  lastName: string().min(4, {
    message: "Last Name needs at least 4 characters.",
  }),
  email: string()
    .min(5, { message: "Email needs at least 5 characters." })
    .email({ message: "Make sure the email is valid." }),
  password: string().min(6, {
    message: "Password must be at least 6 characters long.",
  }),
  admin: number().optional(),
});

export type UserField = z.infer<typeof registerSchema>;

router.get("/me", [auth, admin], async (req: CustomRequest, res: Response) => {
  const [rowUser] = await getUser(req.user?.email!);
  const user = { ...(rowUser as UserField), password: undefined };

  res.send(user);
});

router.get("/", auth, async (req: Request, res: Response) => {
  const users = await getUsers();

  return res.send(users);
});

router.post("/", async (req: Request<{}, {}, UserField>, res: Response) => {
  console.log(req.body);

  const validation = registerSchema.safeParse(req.body);
  const { error, data } = validation;
  const { firstName, lastName, email, password } = data || {};
  if (!validation.success)
    return res.status(404).send(error?.errors[0].message);

  const newUser = await getUserByEmail(email || "");

  if (!newUser) return res.status(400).send("User alreay exists!");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password!, salt);

  const user = (await createUser({
    firstName: firstName!,
    lastName: lastName!,
    email: email!,
    password: hashedPassword,
    admin: 0,
  })) as User;

  console.log("==============user======================");
  console.log(user);
  console.log("===============user=====================");

  const token = generateAuthToken(user);
  res.send(token);

  console.log("==============token======================");
  console.log(token);
  console.log("===============token=====================");
});

export default router;
