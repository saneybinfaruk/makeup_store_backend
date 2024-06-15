import { log } from "console";
import db from "./db-connection";
import { RowDataPacket } from "mysql2";

export interface Coupon extends RowDataPacket {
  id: number;
  code: string;
  discount: number;
  expiration_date: Date;
  is_active: number;
  usage_limit: number;
  used_count: number;
}
export const getCouponDetails = async (coupon: string) => {
  const query = `SELECT * FROM coupons WHERE code = ? AND is_active = 1`;

  const [result] = await db.query<Coupon[]>(query, [coupon]);

  return result;
};

export const UpdateCouponState = async (id: number) => {
  const query = `UPDATE coupons SET used_count = used_count + 1 WHERE id = ?`;
  await db.query(query, [id]);
};
