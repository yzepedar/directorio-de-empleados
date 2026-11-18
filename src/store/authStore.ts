import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSession } from '../types/employee';

interface AuthState {
  session: UserSession | null;
  setSession: (session: UserSession) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      updateTokens: (accessToken, refreshToken) =>
        set((state) => ({
          session: state.session
            ? { ...state.session, accessToken, refreshToken }
            : null,
        })),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);