import { HiChatBubbleLeftRight } from "react-icons/hi2";
import { Vendor } from "@/data/vendorMatrix";
import SuggestedPrompts from "./SuggestedPrompts";

interface AtomCalloutProps {
  vendors: Vendor[];
  onOpenChat: () => void;
  onPromptClick: (prompt: string) => void;
}

export default function AtomCallout({ vendors, onOpenChat, onPromptClick }: AtomCalloutProps) {
  return (
    <div className="my-8 p-5 md:p-6 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/30">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
        {/* Left: Icon + Content */}
        <div className="flex items-start gap-3 flex-1">
          <HiChatBubbleLeftRight className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-secondary mb-1.5">
              Chat with Atom to dive deeper
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed">
              Compare deployment models, IP ownership, and capabilities
            </p>
          </div>
        </div>
        
        {/* Right: CTA */}
        <button
          onClick={onOpenChat}
          className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-colors text-sm font-medium"
        >
          <HiChatBubbleLeftRight className="w-4 h-4" />
          Open Chat
        </button>
      </div>
      
      {/* Suggested prompts */}
      <SuggestedPrompts vendors={vendors} onPromptClick={onPromptClick} />
      
      {/* Disclaimer */}
      <p className="text-xs text-foreground/40 mt-3">
        Directional comparison — confirm during procurement.
      </p>
    </div>
  );
}

