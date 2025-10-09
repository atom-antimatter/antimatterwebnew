"use client";
import MainLayout from "@/components/ui/MainLayout";
import TransitionContainer from "@/components/ui/TransitionContainer";
import VoiceAgent3DSphere from "@/components/VoiceAgent3DSphere";
import Button from "@/components/ui/Button";
import { VOICE_AGENT_SYSTEM_PROMPT } from "@/lib/voiceAgentPrompt";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { HiMicrophone, HiPhone } from "react-icons/hi2";
import { BsFillMicMuteFill } from "react-icons/bs";

type ConnectionState = "idle" | "connecting" | "connected" | "disconnected";

const VoiceAgentDemo = () => {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

  // Audio analyzer for detecting when AI is speaking
  const startAudioAnalyzer = useCallback((stream: MediaStream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkAudio = () => {
      if (!analyserRef.current) return;

      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

      // Threshold for detecting speech
      setIsSpeaking(average > 10);

      animationFrameRef.current = requestAnimationFrame(checkAudio);
    };

    checkAudio();
  }, []);

  // Stop audio analyzer
  const stopAudioAnalyzer = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsSpeaking(false);
  }, []);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleConnect = async () => {
    try {
      setConnectionState("connecting");
      setError(null);

      // Get ephemeral token from our API
      const tokenResponse = await fetch("/api/voice-agent-token");
      if (!tokenResponse.ok) {
        throw new Error("Failed to get session token");
      }

      const { clientSecret } = await tokenResponse.json();
      const EPHEMERAL_KEY = clientSecret.value;

      // Create peer connection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Set up audio for receiving
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
        startAudioAnalyzer(e.streams[0]);
      };

      // Add local audio track for microphone input
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      pc.addTrack(ms.getTracks()[0]);

      // Set up data channel for sending/receiving events
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;

      // Send session update with instructions
      dc.addEventListener("open", () => {
        const sessionUpdate = {
          type: "session.update",
          session: {
            instructions: VOICE_AGENT_SYSTEM_PROMPT,
            voice: "verse",
            input_audio_transcription: {
              model: "whisper-1",
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
          },
        };
        dc.send(JSON.stringify(sessionUpdate));
        console.log("Session configured with Atom personality");

        // Wait a moment for session to be ready, then trigger greeting
        setTimeout(() => {
          // Add a conversation item to trigger Atom's introduction
          const greetingItem = {
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: "Hello! Please introduce yourself.",
                },
              ],
            },
          };
          dc.send(JSON.stringify(greetingItem));

          // Trigger a response from the assistant
          const responseCreate = {
            type: "response.create",
          };
          dc.send(JSON.stringify(responseCreate));
          console.log("Triggered Atom's introduction");
        }, 500);
      });

      // Handle incoming messages
      dc.addEventListener("message", (e) => {
        const msg = JSON.parse(e.data);
        
        if (msg.type === "error") {
          console.error("Realtime API error:", msg);
          setError(msg.error?.message || "An error occurred");
        }
        
        // Log interesting events for debugging
        if (
          msg.type === "conversation.item.created" ||
          msg.type === "response.done"
        ) {
          console.log("Event:", msg.type, msg);
        }
      });

      // Create and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to OpenAI Realtime API
      const sdpResponse = await fetch(
        "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
        {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${EPHEMERAL_KEY}`,
            "Content-Type": "application/sdp",
          },
        }
      );

      if (!sdpResponse.ok) {
        throw new Error(`Failed to connect: ${sdpResponse.statusText}`);
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

      setConnectionState("connected");
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
    stopAudioAnalyzer();

    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setConnectionState("disconnected");
    setTimeout(() => {
      setConnectionState("idle");
      setIsMuted(false);
    }, 500);
  }, [stopAudioAnalyzer]);

  const toggleMute = () => {
    if (peerConnectionRef.current) {
      const audioTrack = peerConnectionRef.current
        .getSenders()
        .find((sender) => sender.track?.kind === "audio")?.track;

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
              Experience natural, real-time voice interactions powered by OpenAI&apos;s Realtime API.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-zinc-900/30 rounded-lg border border-foreground/10">
                <div className="font-semibold mb-1">Natural Conversations</div>
                <div className="text-foreground/60">
                  Powered by GPT-4o Realtime
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
