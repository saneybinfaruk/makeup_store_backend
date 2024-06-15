import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { string, z } from "zod";
import { getUser, getUserByEmail } from "../database/users";
import generateAuthToken from "../utility/token";
import { User } from "../entities/User";

const router = express.Router();

const loginSchema = z.object({
  email: string()
    .min(5, { message: "Email needs at least 5 characters." })
    .email({ message: "Make sure the email is valid." }),
  password: string().min(6, {
    message: "Password must be at least 6 characters long.",
  }),
});

type UserField = z.infer<typeof loginSchema>;

type UserFields = {
  id?: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password?: string;
  admin?: number;
};

router.post("/", async (req: Request<{}, {}, UserField>, res: Response) => {
  const { success, data, error } = loginSchema.safeParse(req.body);
  if (!success) return res.status(400).send(error.errors[0].message);

  const newUser = await getUserByEmail(data.email);
  if (newUser) return res.status(400).send("Invalid email or password!");

  const [rowUser] = await getUser(data.email);

  const user = rowUser as User;
  const validPassword = await bcrypt.compare(
    data.password,
    user.password as string
  );
  if (!validPassword) return res.status(400).send("Invalid email or password!");

  const filteredUser = { ...user, password: undefined };
  const token = generateAuthToken(filteredUser);

  res.send(token);
});



export default router;
