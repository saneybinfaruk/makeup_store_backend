import jwt from "jsonwebtoken";
import dotenv from "dotenv";   
import { User } from "../entities/User";

dotenv.config();
export default function (user: User) {
  return jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      admin: user.admin,
    },
    process.env.JWT_PRIVATE_KEY as string
  );
}
