export interface Store {
  id: number;
  name: string;
  address: string;
  created_at: string;
}

export type StoreInput = Pick<Store, "name" | "address">;
