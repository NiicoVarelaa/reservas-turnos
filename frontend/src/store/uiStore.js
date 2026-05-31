import { create } from 'zustand'

export const useUiStore = create((set) => ({
  isMobileMenuOpen: false,
  isSidebarOpen: true,
  theme: 'light',

  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setTheme: (theme) => set({ theme }),

  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen })
}))
