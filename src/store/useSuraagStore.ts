import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Case, ChatMessage, SimulationState } from '../types';

interface User {
  id: string;
  employeeId: string;
  role: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
}

interface SuraagStoreState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;

  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  selectedCaseId: string;
  setSelectedCaseId: (id: string) => void;
  selectedCase: Case | null;
  setSelectedCase: (c: Case | null) => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;

  missionControlFilters: {
    status: string;
    priority: string;
    search: string;
  };
  setMissionControlFilters: (filters: Partial<{ status: string; priority: string; search: string }>) => void;

  simulation: SimulationState;
  setSimulationState: (updates: Partial<SimulationState>) => void;
  togglePlayback: () => void;
  resetPlayback: () => void;

  chatHistory: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;
}

export const useSuraagStore = create<SuraagStoreState>()(
  persist(
    (set, get) => ({
      user: { id: 'u1', employeeId: 'DIR-001', role: 'Director', name: 'Director Vance', email: 'vance@suraag.ai' },
      token: 'mock-token',
      isAuthenticated: true,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: true }), // Keep true to avoid lockout

      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),

      selectedCaseId: 'CASE-2026-884A',
      setSelectedCaseId: (id) => set({ selectedCaseId: id }),
      selectedCase: null,
      setSelectedCase: (c) => set({ selectedCase: c }),

      activeTab: 'Mission Control',
      setActiveTab: (tab) => set({ activeTab: tab }),

      missionControlFilters: {
        status: 'ALL',
        priority: 'ALL',
        search: '',
      },
      setMissionControlFilters: (updates) =>
        set((state) => ({
          missionControlFilters: { ...state.missionControlFilters, ...updates },
        })),

      simulation: {
        isPlaying: false,
        currentTime: 0,
        playbackSpeed: 1.0,
        selectedEvidenceId: null,
        cameraPreset: 'ISOMETRIC',
        lightingMode: 'NORMAL',
        showMeasurements: true,
        showVisibilityCone: true,
      },
      setSimulationState: (updates) =>
        set((state) => ({
          simulation: { ...state.simulation, ...updates },
        })),
      togglePlayback: () =>
        set((state) => ({
          simulation: { ...state.simulation, isPlaying: !state.simulation.isPlaying },
        })),
      resetPlayback: () =>
        set((state) => ({
          simulation: { ...state.simulation, isPlaying: false, currentTime: 0 },
        })),

      chatHistory: [
        {
          id: 'msg-init',
          role: 'model',
          text: 'Suraag AI Tactical Intelligence online. Case **CASE-2026-884A** loaded. Multi-sensor fusion active with 94.2% confidence. How may I assist in your investigation?',
          timestamp: new Date().toISOString(),
          confidence: 99.8,
        },
      ],
      addChatMessage: (msg) =>
        set((state) => ({
          chatHistory: [
            ...state.chatHistory,
            {
              ...msg,
              id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              timestamp: new Date().toISOString(),
            },
          ],
        })),
      clearChatHistory: () =>
        set({
          chatHistory: [
            {
              id: `msg-${Date.now()}`,
              role: 'model',
              text: 'Conversation cleared. AI Reasoning Engine ready for query.',
              timestamp: new Date().toISOString(),
              confidence: 99.9,
            },
          ],
        }),
    }),
    {
      name: 'suraag-ai-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        selectedCaseId: state.selectedCaseId,
        activeTab: state.activeTab,
      }),
    }
  )
);
