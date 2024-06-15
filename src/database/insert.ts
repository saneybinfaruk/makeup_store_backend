import fs from "fs/promises";
import { RowDataPacket } from "mysql2/promise";
import db from "./db-connection";

interface Products extends RowDataPacket {
  id: number;
  brand: string;
  name: string;
  price: string | null;
  price_sign: string | null;
  currency: string | null;
  image_link: string | null;
  product_link: string | null;
  website_link: string | null;
  description: string | null;
  rating: number | null;
  category: string | null;
  product_type: string | null;
  created_at: string | null; // Consider using Date or a more specific date/time type
  updated_at: string | null; // Consider using Date or a more specific date/time type
  product_api_url: string | null;
  api_featured_image: string | null;
}

const insertProductTags = async (productID: number, tag: string) => {
  await db.query("INSERT INTO products_tags (product_id, tag) VALUES(?,?)", [
    productID,
    tag,
  ]);
};
const insertProductColors = async (
  productID: number,
  colorName: string,
  hexValue: string
) => {
  await db.query(
    "INSERT INTO products_colors (product_id, color_name, hex_value) VALUES(?,?,?)",
    [productID, colorName, hexValue]
  );
};
/*  product_id, brand, name, price, price_sign, currency, image_link, product_link, website_link, description, rating, category, product_type, created_at, updated_at, product_api_url, api_featured_image */
const insertProduct = async (
  product_id: number,
  brand: string,
  name: string,
  price: string,
  price_sign: string,
  description: string,
  rating: number,
  categorie: string,
  product_type: string,
  api_featured_image: string,
  stock: number
) => {
  await db.query(
    "INSERT INTO products(product_id, brand, name, price, price_sign, description, rating, categorie, product_type, api_featured_image, stock) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
    [
      product_id,
      brand,
      name,
      price,
      price_sign,
      description,
      rating,
      categorie,
      product_type,
      api_featured_image,
      stock,
    ]
  );
};

const start = async () => {
  const jsonFile = await fs.readFile("./src/assets/makeup.json", "utf-8");
  const products: Products[] = JSON.parse(jsonFile);

  /* product_id,
      brand,
      name,
      price,
      price_sign,
      currency,
      image_link,
      product_link,
      website_link,
      description,
      rating,
      categorie,
      product_type,
      created_at,
      updated_at,
      product_api_url,
      api_featured_image,*/
  for (const product of products) {
    const createdAtDate = new Date(product.created_at!);
    const createdAtTimestamp = createdAtDate
      .toISOString()
      .replace("T", " ")
      .replace("Z", "")
      .slice(0, 19); // Convert to MySQL timestamp format

    const updatedAtDate = new Date(product.updated_at!);
    const updatedAtDateTimestamp = updatedAtDate
      .toISOString()
      .replace("T", " ")
      .replace("Z", "")
      .slice(0, 19); // Convert to MySQL timestamp format

    await insertProduct(
      product.id,
      product.brand,
      product.name,
      product.price!,
      product.price_sign!,
      product.description!,
      product.rating!,
      product.category!,
      product.product_type!,
      product.api_featured_image!,
      100
    );
    for (const colorValue of product.product_colors) {
      await insertProductColors(
        product.id,
        colorValue.colour_name,
        colorValue.hex_value
      );
    }

    for (const tag of product.tag_list) {
      await insertProductTags(product.id, tag);
    }
  }

  console.log("====================================");
  console.log("DONE");
  console.log("====================================");
};

start();
