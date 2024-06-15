import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "./db-connection";

interface Orders extends RowDataPacket {
  order_id: number;
  user_id: number;
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
  total: number;
  discount: number;
  created_at: number;
  updated_at: number;
}

interface OrderItems extends RowDataPacket {
  order_id: number;
  api_featured_image: string;
  name: string;
  quantity: number;
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
}

export const insertOrder = async (
  userId: number,
  totalPrice: number,
  discount: number
) => {


  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO orders (user_id, total, discount) VALUES (?,?,?)`,
    [userId, totalPrice, discount]
  );
 

  return result.insertId;
};

export const insertOrderItem = async (
  orderId: number,
  productId: number,
  colorName: string,
  colorValue: string,
  quantity: number,
  priceOfEachItem: number,
  discount: number,
  total: number
) => {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO 
    order_items 
    (order_id, product_id, color_name, color_value, quantity, price, discount, total)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
      orderId,
      productId,
      colorName,
      colorValue,
      quantity,
      priceOfEachItem,
      discount,
      total,
    ]
  );

  const query = `UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?`;
  await db.query(query, [quantity, productId, quantity]);

  return result.insertId;
};

export const getOrdersByUserId = async (userId: number) => {
  const query = `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`;

  const [orders] = await db.query<Orders[]>(query, [userId]);

  const orderIds = orders.map((r) => r.order_id);

  const orderItems = await getOrderItemsBytOrderId(orderIds);

  const response = orders.map((order) => {
    return {
      orderId: order.order_id,
      orderPlacedDate: order.created_at,
      orderedItems: orderItems.filter(
        (orderItem) => orderItem.order_id === order.order_id
      ),
    };
  });

  console.log("==============response======================");
  console.log(response);
  console.log("====================================");

  return response;
};

const getOrderItemsBytOrderId = async (ids: number[]) => {
  const query = `SELECT 
  order_items.order_id, order_items.color_name, order_items.color_value, order_items.quantity,order_items.price, order_items.total , products.api_featured_image,products.name, orders.status
  FROM 
  order_items
  JOIN products ON order_items.product_id = products.product_id
  JOIN orders ON order_items.order_id = orders.order_id
  WHERE order_items.order_id IN (?)`;
  const [result] = await db.query<OrderItems[]>(query, [ids]);

  return result;
};
