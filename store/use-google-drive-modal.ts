import { create } from "zustand";

interface GoogleDriveModalStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useGoogleDriveModal = create<GoogleDriveModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));