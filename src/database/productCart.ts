import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "./db-connection";

interface Carts extends ResultSetHeader {
  insertedId: number;
}

interface CartItem extends RowDataPacket {
  cart_item_id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  color_name: string;
  color_value: string;
  created_at: string; // or Date if you plan to convert it to a Date object
  updated_at: string; // or Date if you plan to convert it to a Date object
  id: number;
  brand: string;
  name: string;
  price: number;
  price_sign: string | null;
  currency: string | null;
  image_link: string;
  product_link: string;
  website_link: string;
  description: string;
  rating: number;
  categorie: string | null;
  product_type: string;
  product_api_url: string;
  api_featured_image: string;
  stock: number;
  discount_percent: number | null;
  sale_price: number | null;
  sale_start_date: string | null; // or Date if you plan to convert it to a Date object
  sale_end_date: string | null; // or Date if you plan to convert it to a Date object
}

export const getAllCartItemsByUserId = async (userId: number) => {
  const query = `SELECT cart_items.*, products.* FROM cart_items 
  JOIN carts ON carts.cart_id = cart_items.cart_id 
  JOIN products ON products.product_id = cart_items.product_id 
  WHERE carts.user_id = ?`;

  const [result] = await db.query<CartItem[]>(query, [userId]);

  const response = result.map((r) => {
    return {
      color: { color_name: r.color_name, value: r.color_value },
      quantity: r.quantity,
      product: {
        product_id: r.product_id,
        name: r.name,
        price: r.price,
        price_sign: r.price_sign,
        brand: r.brand,
        product_type: r.product_type,
        categorie: r.categorie,
        description: r.description,
        api_featured_image: r.api_featured_image,
        stock: r.stock,
      },
    };
  });

  return response;
};

export const getCartItem = async (
  productId: number,
  userId: number,
  colorName: string,
  colorValue: string
) => {
  const query = `SELECT * FROM cart_items 
  JOIN carts ON carts.cart_id = cart_items.cart_id 
  WHERE carts.user_id = ? 
  AND 
  cart_items.product_id = ? 
  AND
  cart_items.color_name = ? 
  AND
  cart_items.color_value = ?`;

  const [result] = await db.query<RowDataPacket[]>(query, [
    userId,
    productId,
    colorName,
    colorValue,
  ]);

  return result.length > 0 ? "itemExitst" : null;
};
export const insertCartItem = async (
  product_id: number,
  quantity: number,
  userId: number,
  colorName: string,
  colorValue: string
) => {
  const itemExist = await getCartItem(
    product_id,
    userId,
    colorName,
    colorValue
  );

  if (itemExist) {
    console.log("=============itemExist=======================");
    console.log(itemExist);
    console.log("=============itemExist=======================");
    await updateCartItem(product_id, quantity, colorName, colorValue, userId);
  } else {
    const cartId = await insertCart(userId);

    const query = `INSERT INTO cart_items
      (cart_id, product_id, quantity, color_name, color_value)
      VALUES
      (?,?,?,?,?)`;

    const [{ insertId }] = await db.query<ResultSetHeader>(query, [
      cartId,
      product_id,
      quantity,
      colorName,
      colorValue,
    ]);

    console.log("====================================");
    console.log(insertId);

    console.log("Inserted");
    console.log("====================================");
  }
};

const insertCart = async (userId: number) => {
  const query = `SELECT cart_id FROM carts WHERE user_id = ? and status = 'active'`;

  const [cartId] = await db.query<RowDataPacket[]>(query, [userId]);

  const alreadyExists = cartId.length > 0 ? true : false;

  if (alreadyExists) {
    const { cart_id } = cartId[0] as { cart_id: number };
    return cart_id;
  }

  const cartInsertQuery = `INSERT INTO carts (user_id) VALUES (?)`;

  const [{ insertId }] = await db.query<ResultSetHeader>(cartInsertQuery, [
    userId,
  ]);

  return insertId;
};

export const updateCartItem = async (
  product_id: number,
  quantity: number,
  colorName: string,
  colorValue: string,
  userId: number
) => {
  const updateQuery = `
  UPDATE cart_items 
  SET quantity = ? 
  WHERE 
  product_id = ? 
  AND
  cart_items.color_name = ? 
  AND
  cart_items.color_value = ?
  AND 
  cart_id = 
  (SELECT cart_id FROM carts WHERE user_id = ?)
  `;
  await db.query(updateQuery, [
    quantity,
    product_id,
    colorName,
    colorValue,
    userId,
  ]);

  console.log("====================================");
  console.log("Updated");
  console.log("====================================");
};

export const deleteCartItem = async (
  product_id: number,
  colorName: string,
  colorValue: string,
  userId: number
) => {
  const deleteQuery = `
  DELETE FROM cart_items  
  WHERE 
  product_id = ? 
  AND
  cart_items.color_name = ? 
  AND
  cart_items.color_value = ?
  AND 
  cart_id = 
  (SELECT cart_id FROM carts WHERE user_id = ?)
  `;
  await db.query(deleteQuery, [product_id, colorName, colorValue, userId]);
};
