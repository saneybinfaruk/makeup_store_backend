import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { UserField } from "../routes/users";
import db from "./db-connection";

export const getUsers = async () => {
  const [users] = await db.query(
    `SELECT user_id, first_name,last_name, email FROM users`
  );
  return users;
};

export const getUser = async (email: string) => {
  const [user] = await db.query<RowDataPacket[]>(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  );

  return user;
};

export const getUserByEmail = async (email: string) => {
  const [user] = await db.query<RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  return user.length === 0;
};

interface Result extends ResultSetHeader {
  insertId: number;
}
export const createUser = async ({
  firstName,
  lastName,
  email,
  password,
}: UserField) => {
  const [result] = await db.query<Result>(
    `INSERT INTO users (first_name, last_name,email,password ) VALUES (?,?,?,?)`,
    [firstName, lastName, email, password]
  );

  const [user] = await db.query<RowDataPacket[]>(
    `SELECT * FROM users WHERE user_id = ?`,
    [result.insertId]
  );

  return user[0];
};
