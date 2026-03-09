/**
 * modalStore — global single-modal manager.
 *
 * Only ONE modal can be open at a time. Opening a new modal automatically
 * closes the previous one. This prevents overlapping modals and trapped UI states.
 */
import { create } from "zustand";

export type ModalType = "none" | "layers" | "power" | "datacenter" | "linode";

interface ModalState {
  activeModal: ModalType;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: "none",
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: "none" }),
}));
