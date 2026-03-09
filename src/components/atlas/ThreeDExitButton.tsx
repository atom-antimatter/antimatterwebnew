"use client";

import { X } from "lucide-react";

type Props = {
  visible: boolean;
  onClick: () => void;
};

export default function ThreeDExitButton({ visible, onClick }: Props) {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        fixed top-20 right-4 z-40
        flex items-center gap-2
        h-9 px-3.5 rounded-full
        bg-[rgba(6,7,15,0.85)] backdrop-blur-md
        border border-[rgba(246,246,253,0.15)]
        text-[rgba(246,246,253,0.8)]
        hover:bg-[rgba(6,7,15,0.95)] hover:border-[rgba(246,246,253,0.3)] hover:text-white
        transition-all duration-200
        shadow-lg
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#696aac]
        animate-in fade-in slide-in-from-top-2 duration-200
      "
    >
      <X className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">Exit 3D</span>
    </button>
  );
}
