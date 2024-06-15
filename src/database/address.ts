import { count } from "console";
import db from "./db-connection";
import { ResultSetHeader, RowDataPacket } from "mysql2";
 

export const insertAddress = async (
  userId: number,
  address_line: string,
  city: string,
  state: string,
  zip: string,
  country: string
) => {
  const query = `INSERT INTO 
  address (user_id, address_line, city, state, zip, country) 
  VALUES(?,?,?,?,?,?)`;

  const [result] = await db.query<ResultSetHeader>(query, [
    userId,
    address_line,
    city,
    state,
    zip,
    country,
  ]);

  return result.insertId > 0 ? "Address inserted" : "Something wrong!";
};

export const getAllAddressesByUserId = async (userId: number) => {
  const query = `SELECT * FROM address WHERE user_id = ?`;
  const [result] = await db.query<RowDataPacket[]>(query, [userId]);
  return result;
};

export const getSelectedAddress = async (userId: number) => {
  const query = `SELECT * 
  FROM address 
  WHERE (address_type = 'shipping' OR address_type = 'billing' OR address_type = 'both') 
  AND user_id = ? `;

  const [result] = await db.query<RowDataPacket[]>(query, [userId]);

  return result.length > 0 ? result : "Nothing found!";
};

export const setAddressType = async (
  userId: number,
  address_id: number,
  type: string
) => {
  let resetQuery = "";

  if (type === "both") {
    resetQuery = `UPDATE address SET address_type = "none" WHERE user_id = ?`;
  } else {
    const a = `SELECT * FROM address WHERE user_id = ? AND address_type = 'both'`;

    const [result] = await db.query<RowDataPacket[]>(a, [userId]);
    if (result.length > 0) {
      resetQuery = `UPDATE address SET address_type = "none" WHERE user_id = ?`;
    } else {
      resetQuery = `UPDATE address SET address_type = "none" 
      WHERE user_id = ? AND address_type = ?`;
    }
  }

  await db.query(resetQuery, [userId, type]);

  const query = `UPDATE address SET address_type = ? WHERE address_id = ?`;

  await db.query(query, [type, address_id]);
};

export const deleteAddressById = async (userId: number, address_id: number) => {
  const query = `DELETE
  FROM address 
  WHERE user_id = ?
  AND address_id = ? `;

  const [result] = await db.query<ResultSetHeader>(query, [userId, address_id]);
  return result.insertId;
};

export const getAddressById = async (userId: number, address_id: number) => {
  const query = `SELECT * FROM address WHERE user_id = ? AND address_id = ?`;
  const [result] = await db.query<RowDataPacket[]>(query, [userId, address_id]);
  return result;
};
export const updateAddressById = async (
  address_line: string,
  city: string,
  state: string,
  zip: string,
  country: string,
  userId: number,
  address_id: number
) => {


  
  const query = `UPDATE address 
  SET address_line = ?, city = ?, state = ?, zip = ?, country = ?
  WHERE user_id = ? AND address_id = ?`;
  const [result] = await db.query<ResultSetHeader>(query, [
    address_line,
    city,
    state,
    zip,
    country,
    userId,
    address_id,
  ]);
  return result;
};
