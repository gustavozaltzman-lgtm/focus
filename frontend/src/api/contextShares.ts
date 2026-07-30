import { Task } from '../types/domain';
import { apiClient } from './client';

export interface ContextShare {
  id: string;
  context_id: string;
  shared_with_user_id: string;
  shared_with_email: string;
  shared_with_name: string;
  created_at: string;
}

export interface SharedContextSummary {
  id: string;
  name: string;
  color_hex: string;
  owner_name: string;
}

export interface SharedContextView {
  context: { id: string; name: string; color_hex: string };
  isOwner: boolean;
  ownerName: string;
  tasks: Task[];
}

export async function fetchShares(contextId: string): Promise<ContextShare[]> {
  const { data } = await apiClient.get<{ shares: ContextShare[] }>(
    `/contexts/${contextId}/shares`,
  );
  return data.shares;
}

export async function createShare(contextId: string, email: string): Promise<void> {
  await apiClient.post(`/contexts/${contextId}/shares`, { email });
}

export async function revokeShare(contextId: string, shareId: string): Promise<void> {
  await apiClient.delete(`/contexts/${contextId}/shares/${shareId}`);
}

export async function fetchSharedWithMe(): Promise<SharedContextSummary[]> {
  const { data } = await apiClient.get<{ contexts: SharedContextSummary[] }>(
    '/contexts/shared-with-me',
  );
  return data.contexts;
}

export async function fetchSharedView(contextId: string): Promise<SharedContextView> {
  const { data } = await apiClient.get<SharedContextView>(`/contexts/${contextId}/shared-view`);
  return data;
}
