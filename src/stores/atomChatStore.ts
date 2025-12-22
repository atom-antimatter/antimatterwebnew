import { create } from "zustand";

interface AtomChatStore {
  isOpen: boolean;
  prefill: string | null;
  autoSend: boolean;
  open: (opts?: { prefill?: string; autoSend?: boolean }) => void;
  close: () => void;
}

export const useAtomChatStore = create<AtomChatStore>((set) => ({
  isOpen: false,
  prefill: null,
  autoSend: false,
  open: (opts) => {
    console.log("[AtomChat] Opening chat", opts);
    set({
      isOpen: true,
      prefill: opts?.prefill || null,
      autoSend: opts?.autoSend || false,
    });
  },
  close: () => {
    console.log("[AtomChat] Closing chat");
    set({
      isOpen: false,
      prefill: null,
      autoSend: false,
    });
  },
}));

