"use client";
import MainLayout from "@/components/ui/MainLayout";
import TransitionContainer from "@/components/ui/TransitionContainer";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { HiMicrophone, HiPhone } from "react-icons/hi2";
import { BsFillMicMuteFill } from "react-icons/bs";

type ConnectionState = "idle" | "connecting" | "connected" | "disconnected";

const VoiceAgentDemo = () => {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (connectionState === "connected") {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setDuration(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [connectionState]);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleConnect = () => {
    setConnectionState("connecting");
    // Simulate connection
    setTimeout(() => {
      setConnectionState("connected");
    }, 1500);
  };

  const handleDisconnect = () => {
    setConnectionState("disconnected");
    setTimeout(() => {
      setConnectionState("idle");
      setIsMuted(false);
    }, 500);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <TransitionContainer>
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Antimatter{" "}
              <span className="text-secondary italic">Voice Agent</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto">
              Ask me anything about Antimatter AI—our services, case studies,
              technologies, and more.
            </p>
          </motion.div>

          {/* Voice Interface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full max-w-2xl"
          >
            {/* Main Card */}
            <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 border border-foreground/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
              {/* Status Indicator */}
              <div className="text-center mb-8">
                <AnimatePresence mode="wait">
                  {connectionState === "idle" && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-foreground/60 text-sm"
                    >
                      Ready to chat
                    </motion.div>
                  )}
                  {connectionState === "connecting" && (
                    <motion.div
                      key="connecting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-secondary text-sm animate-pulse"
                    >
                      Connecting...
                    </motion.div>
                  )}
                  {connectionState === "connected" && (
                    <motion.div
                      key="connected"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <span className="text-secondary text-sm font-medium">
                        Antimatter Assistant
                      </span>
                      <span className="text-foreground/60 text-xs font-mono">
                        {formatDuration(duration)}
                      </span>
                    </motion.div>
                  )}
                  {connectionState === "disconnected" && (
                    <motion.div
                      key="disconnected"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-foreground/60 text-sm"
                    >
                      Call ended
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Voice Visualization */}
              <div className="flex items-center justify-center mb-10 h-64">
                <AnimatePresence mode="wait">
                  {connectionState === "idle" && (
                    <motion.div
                      key="idle-viz"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative"
                    >
                      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center border border-secondary/30">
                        <HiMicrophone className="w-16 h-16 text-secondary/50" />
                      </div>
                    </motion.div>
                  )}
                  {connectionState === "connecting" && (
                    <motion.div
                      key="connecting-viz"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 w-40 h-40 rounded-full bg-secondary/20 blur-xl"
                      />
                      <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 flex items-center justify-center border-2 border-secondary/50">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <HiMicrophone className="w-16 h-16 text-secondary" />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                  {connectionState === "connected" && (
                    <motion.div
                      key="connected-viz"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative"
                    >
                      {/* Pulsing rings */}
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute inset-0 w-48 h-48 -translate-x-4 -translate-y-4 rounded-full border-2 border-secondary/30"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.6, 0, 0.6],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.4,
                          }}
                        />
                      ))}
                      {/* Center circle */}
                      <motion.div
                        animate={{
                          scale: isAgentSpeaking ? [1, 1.05, 1] : 1,
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: isAgentSpeaking ? Infinity : 0,
                          ease: "easeInOut",
                        }}
                        className="relative w-40 h-40 rounded-full bg-gradient-to-br from-secondary/40 to-primary/40 flex items-center justify-center border-2 border-secondary shadow-lg shadow-secondary/30"
                      >
                        {isMuted ? (
                          <BsFillMicMuteFill className="w-16 h-16 text-white" />
                        ) : (
                          <HiMicrophone className="w-16 h-16 text-white" />
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                  {connectionState === "disconnected" && (
                    <motion.div
                      key="disconnected-viz"
                      initial={{ opacity: 1, scale: 1 }}
                      animate={{ opacity: 0, scale: 0.8 }}
                      className="relative"
                    >
                      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-zinc-700/20 to-zinc-800/20 flex items-center justify-center border border-foreground/20">
                        <HiPhone className="w-16 h-16 text-foreground/30" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                {connectionState === "idle" && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleConnect}
                    className="px-12 py-4 bg-gradient-to-r from-secondary to-primary text-white rounded-full font-medium text-lg hover:shadow-lg hover:shadow-secondary/50 transition-all duration-300 hover:scale-105"
                  >
                    Start Conversation
                  </motion.button>
                )}
                {connectionState === "connected" && (
                  <>
                    {/* Mute button */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={toggleMute}
                      className={`p-4 rounded-full transition-all duration-300 ${
                        isMuted
                          ? "bg-zinc-700 text-white"
                          : "bg-zinc-800 text-foreground/70 hover:bg-zinc-700 hover:text-white"
                      }`}
                    >
                      {isMuted ? (
                        <BsFillMicMuteFill className="w-6 h-6" />
                      ) : (
                        <HiMicrophone className="w-6 h-6" />
                      )}
                    </motion.button>

                    {/* End call button */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={handleDisconnect}
                      className="p-5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-600/50"
                    >
                      <HiPhone className="w-7 h-7 rotate-[135deg]" />
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 max-w-2xl text-center"
          >
            <h3 className="text-xl font-semibold mb-4">
              Try Our AI-Powered Voice Agent
            </h3>
            <p className="text-foreground/70 mb-6">
              This demo showcases a conversational AI trained on Antimatter AI's
              services, case studies, and expertise. Experience natural,
              real-time voice interactions powered by advanced AI technology.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-zinc-900/30 rounded-lg border border-foreground/10">
                <div className="font-semibold mb-1">Natural Conversations</div>
                <div className="text-foreground/60">
                  Powered by OpenAI Realtime API
                </div>
              </div>
              <div className="p-4 bg-zinc-900/30 rounded-lg border border-foreground/10">
                <div className="font-semibold mb-1">24/7 Availability</div>
                <div className="text-foreground/60">
                  Always ready to assist
                </div>
              </div>
              <div className="p-4 bg-zinc-900/30 rounded-lg border border-foreground/10">
                <div className="font-semibold mb-1">Custom Training</div>
                <div className="text-foreground/60">
                  Trained on your content
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </MainLayout>
    </TransitionContainer>
  );
};

export default VoiceAgentDemo;

