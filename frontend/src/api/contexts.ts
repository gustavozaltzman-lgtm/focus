import { Context } from '../types/domain';
import { apiClient } from './client';

export async function fetchContexts(): Promise<Context[]> {
  const { data } = await apiClient.get<{ contexts: Context[] }>('/contexts');
  return data.contexts;
}

export async function fetchContext(id: string): Promise<Context> {
  const { data } = await apiClient.get<{ context: Context }>(`/contexts/${id}`);
  return data.context;
}

export async function createContext(name: string, colorHex: string): Promise<Context> {
  const { data } = await apiClient.post<{ context: Context }>('/contexts', {
    name,
    colorHex,
  });
  return data.context;
}

export async function updateContext(
  id: string,
  payload: { name?: string; colorHex?: string },
): Promise<Context> {
  const { data } = await apiClient.patch<{ context: Context }>(`/contexts/${id}`, payload);
  return data.context;
}

export async function deleteContext(id: string): Promise<void> {
  await apiClient.delete(`/contexts/${id}`);
}
