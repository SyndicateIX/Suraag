import { Case, Evidence, WitnessStatement, Suspect, TimelineEvent, ReconstructionData } from '../types';

const BASE_URL = '/api';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`);
  }
  return res.json();
}

export const apiClient = {
  cases: {
    getAll: (params?: { status?: string; priority?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.status && params.status !== 'ALL') query.set('status', params.status);
      if (params?.priority && params.priority !== 'ALL') query.set('priority', params.priority);
      if (params?.search) query.set('search', params.search);
      return fetchJSON<Case[]>(`/cases?${query.toString()}`);
    },
    getById: (id: string) => fetchJSON<Case & { evidence?: Evidence[]; witnesses?: WitnessStatement[]; suspects?: Suspect[]; timelineEvents?: TimelineEvent[]; reconstruction?: ReconstructionData }>(`/cases/${id}`),
    create: (data: Partial<Case>) => fetchJSON<Case>('/cases', { method: 'POST', body: JSON.stringify(data) }),
  },
  evidence: {
    getAll: (params?: { caseId?: string; category?: string }) => {
      const query = new URLSearchParams();
      if (params?.caseId) query.set('caseId', params.caseId);
      if (params?.category && params.category !== 'ALL') query.set('category', params.category);
      return fetchJSON<Evidence[]>(`/evidence?${query.toString()}`);
    },
    processUpload: (data: { fileName: string; fileType: string; caseId?: string; category?: string }) =>
      fetchJSON<Evidence>('/evidence/process', { method: 'POST', body: JSON.stringify(data) }),
  },
  witnesses: {
    getAll: (caseId?: string) => fetchJSON<WitnessStatement[]>(`/witnesses${caseId ? `?caseId=${caseId}` : ''}`),
  },
  suspects: {
    getAll: (caseId?: string) => fetchJSON<Suspect[]>(`/suspects${caseId ? `?caseId=${caseId}` : ''}`),
  },
  timeline: {
    getAll: (caseId?: string) => fetchJSON<TimelineEvent[]>(`/timeline${caseId ? `?caseId=${caseId}` : ''}`),
  },
  reconstruction: {
    getByCaseId: (caseId: string) => fetchJSON<ReconstructionData>(`/reconstruction/${caseId}`),
  },
  ai: {
    chat: (message: string, caseId: string, history?: any[]) =>
      fetchJSON<{ role: string; text: string; timestamp: string; confidence: number }>('/ai/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ message, caseId, history }),
      }),
  },
};
