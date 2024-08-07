export interface Product {
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
export interface ProductCartItem {
  product: Product;
  quantity: number;
  color: { color_name: string; value: string };
}

export interface UsersProductCart {
  userId: number;
  discount: number;
  cartList: ProductCartItem[];
}
