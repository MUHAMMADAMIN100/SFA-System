import { api } from "@/shared/api";
import { Role } from "@/shared/lib/session";

interface LoginResponse {
  access: string;
  refresh: string;
  role: Role;
  full_name: string;
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login/", {
    username,
    password,
  });
  return data;
}
