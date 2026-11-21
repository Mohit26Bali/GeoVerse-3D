import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LearningMode } from "@/types/module";

interface AppState {
  activeModuleSlug: string | null;
  activeMode: LearningMode;
  sidebarCollapsed: boolean;
  reducedMotion: boolean;

  setActiveModule: (slug: string | null) => void;
  setActiveMode: (mode: LearningMode) => void;
  toggleSidebar: () => void;
  setReducedMotion: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeModuleSlug: null,
      activeMode: "explore",
      sidebarCollapsed: false,
      reducedMotion: false,

      setActiveModule: (slug) => set({ activeModuleSlug: slug }),
      setActiveMode: (mode) => set({ activeMode: mode }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setReducedMotion: (value) => set({ reducedMotion: value }),
    }),
    {
      name: "geoverse:app-preferences",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        reducedMotion: s.reducedMotion,
      }),
    },
  ),
);
