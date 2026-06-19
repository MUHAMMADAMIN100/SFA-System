export interface Product {
  id: number;
  name: string;
  volume: string;
  price: string;
  is_active: boolean;
  created_at: string;
}

export interface ProductInput {
  name: string;
  volume: string;
  price: string;
  is_active: boolean;
}
