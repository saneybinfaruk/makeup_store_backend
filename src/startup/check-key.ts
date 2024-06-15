import env from "dotenv";
import logger from "../utility/loggin";
import { error } from "console";

env.config();

const checkJwtPrivateKey = () => {
  if (!process.env.JWT_PRIVATE_KEY) {
    throw new Error("FATAL ERROR: JWT_PRIVATE_KEY is not defined!");
  }

  process.on("unhandledRejection", (e: Error) => {
    throw new Error(e.stack);
  });
};

export default checkJwtPrivateKey;
