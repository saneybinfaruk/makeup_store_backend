import { QueryResult, RowDataPacket } from "mysql2";
import db from "./db-connection";
import fs from "fs/promises";
import { Console, log } from "console";
import { json } from "stream/consumers";
import { array } from "zod";

export interface Products extends RowDataPacket {
  product_id: number;
  brand: string;
  name: string;
  price: string | null;
  price_sign: string | null;
  description: string | null;
  rating: number | null;
  categorie: string | null;
  product_type: string | null;
  created_at: string | null; // Consider using Date or a more specific date/time type
  api_featured_image: string | null;
}

interface ProductsColor extends RowDataPacket {
  product_id: number;
  color_name: string;
  hex_value: string;
}

interface ProductsTags extends RowDataPacket {
  product_id: number;
  tag: string;
}

export const getProducts = async (
  product_types?: string[],
  brands?: string[],
  categories?: string[],
  tags?: string[],
  minPrice?: number,
  maxPrice?: number,
  sortedBy?: string[],
  pageNumber: number = 1,
  pageSize: number = 10,
  search?: string
) => {
  const offset = (pageNumber - 1) * pageSize;

  let query = `SELECT * FROM products`;
  let countQuery = `SELECT COUNT(*) as total FROM products`;
  let whereClauses: string[] = [];
  let queryParams: (string | number)[] = [];

  if (
    product_types &&
    product_types.length > 0 &&
    !product_types.includes("")
  ) {
    whereClauses.push(
      `product_type IN (${product_types.map(() => "?").join(",")})`
    );
    queryParams.push(...product_types);
  }

  if (brands && brands.length > 0 && !brands.includes("")) {
    whereClauses.push(`brand IN (${brands.map(() => "?").join(",")})`);
    queryParams.push(...brands);
  }
  if (categories && categories.length > 0 && !categories.includes("")) {
    whereClauses.push(`categorie IN ( ${categories.map(() => "?").join(",")})`);
    queryParams.push(...categories);
  }

  if (tags && tags.length > 0 && !tags.includes("")) {
    whereClauses.push(
      ` EXISTS (SELECT product_id FROM products_tags WHERE products.product_id = products_tags.product_id AND products_tags.tag IN (${tags
        .map(() => "?")
        .join(",")}) ) `
    );
    queryParams.push(...tags);
  }

  if (minPrice) {
    whereClauses.push(`price > ?`);
    queryParams.push(minPrice);
  }

  if (maxPrice) {
    whereClauses.push(`price < ?`);
    queryParams.push(maxPrice);
  }

  if (search && search !== "") {
    whereClauses.push(
      ` name LIKE ? OR description LIKE ? OR product_type LIKE ? or categorie LIKE ? `
    );
    queryParams.push(
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`
    );
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ` + whereClauses.join(" AND ");
    countQuery += ` WHERE ` + whereClauses.join(" AND ");
  }

  let orderBy = ` ORDER BY created_at DESC, product_id DESC`;

  if (
    sortedBy &&
    sortedBy.length > 0 &&
    !sortedBy.includes("") &&
    sortedBy[0] !== null
  ) {
    if (sortedBy[0] === "date") sortedBy[0] = "created_at";

    orderBy = ` ORDER BY ${sortedBy[0]} ${sortedBy[1]}, product_id DESC`;
  }

  query += orderBy;
  query += ` LIMIT ? OFFSET ?`;
  queryParams.push(pageSize, offset);

  console.log("====================================");
  console.log(query);
  console.log(queryParams);
  console.log("====================================");

  const [products] = await db.query<Products[]>(query, queryParams);

  const countParams = queryParams.slice(0, -2);
  const [countResult] = await db.query<RowDataPacket[]>(
    countQuery,
    countParams
  );
  const totalProduct = (countResult[0] as { total: number }).total;

  return {
    products,
    totalPages: Math.ceil(totalProduct / pageSize),
  };
};

 
export const getProduct = async (productId: string) => {
  const query = `
  SELECT 
      p.product_id,
      p.brand,
      p.name,
      p.price,
      p.price_sign,
      p.description,
      p.rating,
      p.categorie,
      p.product_type,
      p.created_at,
      p.api_featured_image,
      p.stock,
  GROUP_CONCAT(DISTINCT pc.hex_value) AS hex_values,
  GROUP_CONCAT(DISTINCT pc.color_name) AS color_names,
  GROUP_CONCAT(DISTINCT pt.tag) AS tags
  FROM 
      products p
  LEFT JOIN 
      products_colors pc ON p.product_id = pc.product_id
  LEFT JOIN 
      products_tags pt ON p.product_id = pt.product_id
  WHERE 
      p.product_id = ?
  GROUP BY 
      p.product_id,
      p.brand,
      p.name,
      p.price,
      p.price_sign,
      p.description,
      p.rating,
      p.categorie,
      p.product_type,
      p.created_at,
      p.api_featured_image,
      p.stock
`;

  const [productDetails] = await db.query<Products[]>(query, [productId]);

  if (!productDetails || productDetails.length === 0) {
    throw new Error(`Product with productId ${productId} not found`);
  }
  const product = productDetails[0];
  const colors = product.hex_values
    ? product.hex_values.split(",").map((hex_value: string, index: number) => ({
        hex_value,
        color_name: product.color_names.split(",")[index],
      }))
    : [];

  const tags = product.tags ? product.tags.split(",") : [];

  const relatedProductsQuery = `
    SELECT * FROM products
    WHERE 
      (brand = ? OR product_type = ? OR categorie = ?) 
      AND product_id != ?
    LIMIT 10
  `;

  const [relatedProducts] = await db.query(relatedProductsQuery, [
    product.brand,
    product.product_type,
    product.categorie,
    product.product_id,
  ]);

  return {
    product: {
      product_id: product.product_id,
      brand: product.brand,
      name: product.name,
      price: product.price,
      price_sign: product.price_sign,
      currency: product.currency,
      image_link: product.image_link,
      product_link: product.product_link,
      website_link: product.website_link,
      description: product.description,
      rating: product.rating,
      categorie: product.categorie,
      product_type: product.product_type,
      created_at: product.created_at,
      updated_at: product.updated_at,
      product_api_url: product.product_api_url,
      api_featured_image: product.api_featured_image,
      stock: product.stock,
    },
    colors,
    tags,
    relatedProducts,
  };
};

export const getNewProducts = async () => {
  const [products] = await db.query<Products[]>(
    `SELECT * FROM products WHERE created_at >= DATE_SUB(NOW(), INTERVAL 360 DAY) ORDER BY created_at DESC LIMIT 10`
  );
  return products;
};

export const getProductByIds = async (ids: number[]) => {
  const query = `
  SELECT name,api_featured_image, price,product_id
  FROM 
  products 
  WHERE product_id 
  IN (?)`;

  return await db.query<Products[]>(query, [ids]);
}
