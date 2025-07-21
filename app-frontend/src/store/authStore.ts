import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth'; // Ensure this path is correct

interface AuthState {
  user: User | null;
  accessToken: string | null; // Add accessToken to the state
  hasHydrated: boolean;
  setUser: (user: User) => void;
  setAccessToken: (token: string | null) => void; // Action to set token
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null, // Initialize accessToken
      hasHydrated: false,
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }), // Implement setAccessToken
      logout: () => set({ user: null, accessToken: null }), // Clear token on logout
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        console.log("🔥 Zustand rehydration complete!");
        state?.setHasHydrated(true);
      },
    }
  )
);