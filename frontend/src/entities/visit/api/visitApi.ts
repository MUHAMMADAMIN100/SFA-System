import { api, Paginated } from "@/shared/api";

import { CreateVisitPayload, Visit, VisitFilters } from "../model/types";

export async function createVisit(payload: CreateVisitPayload): Promise<Visit> {
  const form = new FormData();
  form.append("store", String(payload.store));
  form.append("invoice_photo", payload.photo, payload.photo.name);
  form.append("items", JSON.stringify(payload.items));

  const { data } = await api.post<Visit>("/visits/", form);
  return data;
}

export async function fetchVisits(
  filters: VisitFilters = {}
): Promise<Paginated<Visit>> {
  const { data } = await api.get<Paginated<Visit>>("/visits/", {
    params: filters,
  });
  return data;
}

export async function fetchMyVisits(page = 1): Promise<Paginated<Visit>> {
  const { data } = await api.get<Paginated<Visit>>("/visits/my/", {
    params: { page },
  });
  return data;
}
