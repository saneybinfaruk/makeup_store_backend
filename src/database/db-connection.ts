import env from "dotenv";
import mysql from "mysql2/promise";
import logger from "../utility/loggin";

env.config();

const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER_NAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE_NAME,
});

db.getConnection()
  .then((res) => logger.log("info", "Connected"))
  .catch((error) => logger.error(error.message, error));

export default db;
