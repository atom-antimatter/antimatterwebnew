"use client";
import MainLayout from "@/components/ui/MainLayout";
import TransitionContainer from "@/components/ui/TransitionContainer";
import VoiceAgent3DSphere from "@/components/VoiceAgent3DSphere";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { HiMicrophone, HiPhone } from "react-icons/hi2";
import { BsFillMicMuteFill } from "react-icons/bs";

type ConnectionState = "idle" | "connecting" | "connected" | "disconnected";

interface TranscriptItem {
  id: string;
  speaker: "user" | "assistant";
  text: string;
  isComplete: boolean;
}

const VoiceAgentDemo = () => {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

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

  // Play audio buffer
  const playAudioBuffer = useCallback(async (buffer: AudioBuffer) => {
    if (!audioContextRef.current || isPlayingRef.current) return;

    isPlayingRef.current = true;
    setIsSpeaking(true);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    currentSourceRef.current = source;
    
    source.onended = () => {
      setIsSpeaking(false);
      isPlayingRef.current = false;
      currentSourceRef.current = null;
      
      // Play next in queue
      const next = audioQueueRef.current.shift();
      if (next) {
        playAudioBuffer(next);
      }
    };
    
    source.start(0);
  }, []);

  // Process audio queue
  const processAudioQueue = useCallback(() => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
    
    const buffer = audioQueueRef.current.shift();
    if (buffer) {
      playAudioBuffer(buffer);
    }
  }, [playAudioBuffer]);

  const handleConnect = async () => {
    try {
      setConnectionState("connecting");
      setError(null);

      // Get access token from our API
      const tokenResponse = await fetch("/api/voice-agent-token");
      if (!tokenResponse.ok) {
        throw new Error("Failed to get access token");
      }

      const { accessToken } = await tokenResponse.json();

      // Request microphone access with echo cancellation
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // Initialize audio context for playback
      audioContextRef.current = new AudioContext({ sampleRate: 48000 });

      // Get Hume Config ID
      const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID;
      if (!configId) {
        throw new Error("Hume Config ID not configured");
      }

      // Connect to Hume EVI WebSocket with config ID
      const ws = new WebSocket(
        `wss://api.hume.ai/v0/evi/chat?access_token=${accessToken}&config_id=${configId}`
      );
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to Hume EVI");
        
        // Note: System prompt and settings come from the Hume Config ID
        // No need to send session_settings - the config handles it all
        
        // Start sending audio
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            // Convert blob to base64 and send
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Audio = (reader.result as string).split(",")[1];
              ws.send(JSON.stringify({
                type: "audio_input",
                data: base64Audio,
              }));
            };
            reader.readAsDataURL(event.data);
          }
        };

        mediaRecorder.start(100); // Send chunks every 100ms

        setConnectionState("connected");
        
        // Wait for connection to fully establish before first message
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: "user_input",
              text: "Hello! Please introduce yourself briefly.",
            }));
          }
        }, 300);
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        console.log("Hume message:", message.type);

        switch (message.type) {
          case "user_message":
          case "user_input":
            // User speech was transcribed
            if (message.message?.content) {
              setTranscript((prev) => [
                ...prev,
                {
                  id: message.message.id || `user-${Date.now()}`,
                  speaker: "user",
                  text: message.message.content,
                  isComplete: true,
                },
              ]);
            }
            break;

          case "assistant_message":
            // Assistant response text
            if (message.message?.content) {
              setTranscript((prev) => {
                const existing = prev.find(
                  (t) => t.id === message.message.id && t.speaker === "assistant"
                );
                if (existing) {
                  return prev.map((t) =>
                    t.id === message.message.id
                      ? { ...t, text: message.message.content, isComplete: true }
                      : t
                  );
                }
                return [
                  ...prev,
                  {
                    id: message.message.id || `assistant-${Date.now()}`,
                    speaker: "assistant",
                    text: message.message.content,
                    isComplete: false,
                  },
                ];
              });
            }
            break;

          case "audio_output":
            // Received audio from assistant
            if (message.data && audioContextRef.current) {
              try {
                // Decode base64 audio
                const audioData = Uint8Array.from(atob(message.data), c => c.charCodeAt(0));
                const audioBuffer = await audioContextRef.current.decodeAudioData(
                  audioData.buffer
                );
                
                audioQueueRef.current.push(audioBuffer);
                processAudioQueue();
              } catch (err) {
                console.error("Error decoding audio:", err);
              }
            }
            break;

          case "user_interruption":
            // User interrupted - clear audio queue and stop playback
            console.log("User interrupted");
            audioQueueRef.current = [];
            isPlayingRef.current = false;
            setIsSpeaking(false);
            // Stop the currently playing audio source
            if (currentSourceRef.current) {
              try {
                currentSourceRef.current.stop();
                currentSourceRef.current = null;
              } catch (err) {
                // Source might have already stopped
              }
            }
            break;

          case "assistant_end":
            // Assistant finished speaking
            console.log("Assistant finished turn");
            break;

          case "error":
            console.error("Hume error:", message);
            setError(message.message || "An error occurred");
            break;

          default:
            // Handle other message types
            break;
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Connection error occurred");
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        handleDisconnect();
      };

    } catch (err) {
      console.error("Connection error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect to voice agent"
      );
      setConnectionState("idle");
      handleDisconnect();
    }
  };

  const handleDisconnect = useCallback(() => {
    // Stop currently playing audio
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (err) {
        // Already stopped
      }
      currentSourceRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Close WebSocket
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Clear audio queue
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsSpeaking(false);

    setConnectionState("disconnected");
    setTimeout(() => {
      setConnectionState("idle");
      setIsMuted(false);
      setTranscript([]);
    }, 500);
  }, []);

  const toggleMute = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleDisconnect();
    };
  }, [handleDisconnect]);

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
              Meet{" "}
              <span className="text-secondary italic">Atom</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto">
              Your AI-powered guide to Antimatter AI. Ask about our services, case studies,
              technologies, and meet our team.
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
                      Ready to chat with Atom
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
                      Connecting to Atom...
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
                        Atom - Antimatter AI Assistant
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

              {/* 3D Sphere Visualization */}
              <div className="flex items-center justify-center mb-10 h-64">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full"
                >
                  <VoiceAgent3DSphere
                    isActive={connectionState === "connected"}
                    isSpeaking={isSpeaking}
                  />
                </motion.div>
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                {connectionState === "idle" && (
                  <Button onClick={handleConnect} variant="primary">
                    <span className="px-8 lg:px-12 flex items-center gap-2">
                      <HiMicrophone className="w-5 h-5" />
                      Start Conversation
                    </span>
                  </Button>
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
                      title={isMuted ? "Unmute" : "Mute"}
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
                      title="End call"
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
              Experience AI-Powered Voice Conversations
            </h3>
            <p className="text-foreground/70 mb-6">
              Atom is trained on Antimatter AI&apos;s services, case studies, and team expertise.
              Experience natural, real-time voice interactions powered by Hume&apos;s empathic AI.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-zinc-900/30 rounded-lg border border-foreground/10">
                <div className="font-semibold mb-1">Empathic AI</div>
                <div className="text-foreground/60">
                  Powered by Hume EVI
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
                  Expert on our work
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
