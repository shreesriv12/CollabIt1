import { create } from "zustand";

const defaultValues = {
  isOpen: false,
};

interface ISchemaExportModal {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useSchemaExportModal = create<ISchemaExportModal>((set) => ({
  ...defaultValues,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));