"use client";
import { useEffect } from "react";
import { useModalStore } from "@/state/modalStore";

export function useEscapeToCloseModal() {
  const closeModal = useModalStore((s) => s.closeModal);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeModal]);
}
