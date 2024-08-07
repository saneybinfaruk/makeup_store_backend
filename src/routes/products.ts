import express, { Request, Response } from "express";
import { getNewProducts, getProduct, getProducts } from "../database/products";
import { string } from "zod";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const { pageSize, product_type, brand, categorie, tag, minPrice, maxPrice } =
    req.body;

  const query = req.query;

  const productTypes =
    (query.product_type as string)?.split(",").map((t) => t.trim()) || [];
  const productCategories =
    (query.categories as string)?.split(",").map((t) => t.trim()) || [];

  const productBrands =
    (query.brands as string)?.split(",").map((t) => t.trim()) || [];

  const productTags =
    (query.tags as string)?.split(",").map((t) => t.trim()) || [];

  const productmMinPrice = parseInt(query.minPrice as string);
  const productmMaxPrice = parseInt(query.maxPrice as string);

  const sortBy = (query.setSort as string).split(",").map((s) => s.trim());

  const show = isNaN(parseInt(query.showAmount as string))
    ? 10
    : parseInt(query.showAmount as string);

  const pageNumber = isNaN(parseInt(query.pageNumber as string))
    ? 1
    : parseInt(query.pageNumber as string);

  const search = query.search as string;

  const { products, totalPages } = await getProducts(
    productTypes,
    productBrands,
    productCategories,
    productTags,
    productmMinPrice,
    productmMaxPrice,
    sortBy,
    pageNumber,
    show,
    search
  );

  res.send({ products, totalPages });
});

router.get("/new", async (req: Request, res: Response) => {
  const products = await getNewProducts();

  res.send(products);
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const product = await getProduct(id);

  res.send(product);
});

router.get("/:query", async (req: Request, res: Response) => {
  const query = req.params.query;

  console.log("====================================");
  console.log(query);
  console.log("====================================");
  res.send(query);
});

export default router;
