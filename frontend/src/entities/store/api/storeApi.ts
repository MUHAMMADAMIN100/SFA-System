import { api } from "@/shared/api";

import { Store, StoreInput } from "../model/types";

export async function fetchStores(): Promise<Store[]> {
  const { data } = await api.get<Store[]>("/stores/");
  return data;
}

export async function createStore(input: StoreInput): Promise<Store> {
  const { data } = await api.post<Store>("/stores/", input);
  return data;
}

export async function updateStore(id: number, input: StoreInput): Promise<Store> {
  const { data } = await api.patch<Store>(`/stores/${id}/`, input);
  return data;
}

export async function deleteStore(id: number): Promise<void> {
  await api.delete(`/stores/${id}/`);
}
