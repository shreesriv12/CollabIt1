import { create } from "zustand";

interface AIMindmapModalStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useAIMindmapModal = create<AIMindmapModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));