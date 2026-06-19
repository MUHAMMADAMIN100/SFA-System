export type Role = "manager" | "admin";

export interface Manager {
  id: number;
  username: string;
  full_name: string;
  is_active: boolean;
  role: Role;
}

export interface ManagerInput {
  username: string;
  full_name: string;
  password?: string;
  is_active?: boolean;
}
