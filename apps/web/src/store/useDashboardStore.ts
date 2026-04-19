import { create } from "zustand";

interface DashboardState {
  user: { name: string; balance: number } | null;
  isLoggedIn: boolean;
  setAuth: (user: any) => void;
  logout: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  user: null,
  isLoggedIn: false,
  setAuth: (user) => set({ user, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),
}));
