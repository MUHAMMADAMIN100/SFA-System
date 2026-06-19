import { api } from "@/shared/api";

import { Manager, ManagerInput } from "../model/types";

export async function fetchManagers(): Promise<Manager[]> {
  const { data } = await api.get<Manager[]>("/managers/");
  return data;
}

export async function createManager(input: ManagerInput): Promise<Manager> {
  const { data } = await api.post<Manager>("/managers/", input);
  return data;
}

export async function updateManager(
  id: number,
  input: Partial<ManagerInput>
): Promise<Manager> {
  const { data } = await api.patch<Manager>(`/managers/${id}/`, input);
  return data;
}

export async function deleteManager(id: number): Promise<void> {
  await api.delete(`/managers/${id}/`);
}
