import { create } from "zustand";

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isMobileNavOpen: boolean;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  isMobileNavOpen: false,
  toggleMobileNav: () =>
    set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
}));
