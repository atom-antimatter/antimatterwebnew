import { HiChatBubbleLeftRight } from "react-icons/hi2";

interface AtomCalloutProps {
  onOpenChat: () => void;
}

export default function AtomCallout({ onOpenChat }: AtomCalloutProps) {
  return (
    <div className="my-8 p-6 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/30">
      <div className="flex items-start gap-3 mb-3">
        <HiChatBubbleLeftRight className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-semibold text-secondary mb-2">
            Chat with Atom to dive deeper
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            Ask about deployment models (VPC / on-prem / hybrid), IP ownership, security constraints, tool calling, voice mode, RAG, and how Atom compares to the vendors you selected.
          </p>
          <button
            onClick={onOpenChat}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-colors text-sm font-medium"
          >
            <HiChatBubbleLeftRight className="w-4 h-4" />
            Open Atom Chat
          </button>
        </div>
      </div>
    </div>
  );
}

