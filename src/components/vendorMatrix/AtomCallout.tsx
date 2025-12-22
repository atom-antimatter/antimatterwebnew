import { HiChatBubbleLeftRight } from "react-icons/hi2";

interface AtomCalloutProps {
  onOpenChat: () => void;
}

export default function AtomCallout({ onOpenChat }: AtomCalloutProps) {
  return (
    <div className="my-8 p-5 md:p-6 rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
        {/* Left: Icon + Content */}
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <HiChatBubbleLeftRight className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Chat with Atom
            </h3>
            <p className="text-sm text-foreground/60 leading-tight">
              Ask about deployment, IP ownership, security, RAG, voice, GenUI, and tool calling.
            </p>
          </div>
        </div>
        
        {/* Right: CTA */}
        <button
          onClick={onOpenChat}
          className="w-full md:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-all hover:shadow-lg hover:shadow-secondary/20 text-sm font-semibold"
        >
          Ask Atom
        </button>
      </div>
    </div>
  );
}

