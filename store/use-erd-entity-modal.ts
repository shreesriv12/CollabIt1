import { create } from "zustand";
import { ERDEntity } from "@/types/erd";

interface ERDEntityModalState {
  isOpen: boolean;
  editingEntity: ERDEntity | null;
  open: (entity?: ERDEntity) => void;
  close: () => void;
}

export const useERDEntityModal = create<ERDEntityModalState>((set) => ({
  isOpen: false,
  editingEntity: null,
  open: (entity) => set({ isOpen: true, editingEntity: entity || null }),
  close: () => set({ isOpen: false, editingEntity: null }),
}));