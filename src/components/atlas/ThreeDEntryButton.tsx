"use client";

import { Box } from "lucide-react";

type Props = {
  visible: boolean;
  buildingCount: number;
  onClick: () => void;
};

export default function ThreeDEntryButton({ visible, buildingCount, onClick }: Props) {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        fixed bottom-[120px] right-5 z-40
        flex items-center gap-2
        h-10 px-4 rounded-full
        bg-[rgba(105,106,172,0.2)] backdrop-blur-md
        border border-[rgba(133,135,227,0.35)]
        text-[rgba(246,246,253,0.9)]
        hover:bg-[rgba(105,106,172,0.35)] hover:border-[rgba(133,135,227,0.55)] hover:text-white
        transition-all duration-200
        shadow-lg shadow-[rgba(105,106,172,0.15)]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#696aac]
        animate-in fade-in slide-in-from-bottom-2 duration-300
      "
      style={{
        boxShadow: "0 0 20px rgba(133,135,227,0.15), 0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <Box className="w-4 h-4 text-[#a2a3e9]" />
      <span className="text-sm font-medium">Enter 3D View</span>
      <span className="text-[10px] text-[rgba(162,163,233,0.6)] ml-0.5">
        {buildingCount > 0 ? `~${buildingCount.toLocaleString()}` : ""}
      </span>
    </button>
  );
}
