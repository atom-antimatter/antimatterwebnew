/* eslint-disable */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { LuCamera, LuType, LuPlay, LuSquare, LuBrain } from "react-icons/lu";
import { HumeWebSocketClient } from "@/lib/humeWebSocket";
import { motion } from "motion/react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface EmotionScore {
  name: string;
  score: number;
}

interface EmotionalMetrics {
  intensity: number;
  positivity: number;
  authenticity: number;
  complexity: number;
  clarity: number;
  energy: number;
}

interface TextAnalysisResult {
  emotions: EmotionScore[];
  sentiment: {
    label: string;
    confidence: number;
    description: string;
  };
  intent: {
    primary: string;
    confidence: number;
    description: string;
  };
  analysis: string;
  emotionalMetrics: EmotionalMetrics;
}

interface EmotionData {
  timestamp?: string;
  facial?: EmotionScore[];
}

export function EmotionTrackingDemo() {
  const [activeTab, setActiveTab] = useState<"facial" | "text">("text");
  const [textInput, setTextInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [textAnalysisResult, setTextAnalysisResult] = useState<TextAnalysisResult | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  
  // Facial tracking state
  const [facialEmotions, setFacialEmotions] = useState<EmotionScore[]>([]);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [humeClient, setHumeClient] = useState<HumeWebSocketClient | null>(null);
  const [sessionData, setSessionData] = useState<EmotionData[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Hume WebSocket client
  useEffect(() => {
    const initHumeClient = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_HUME_API_KEY;
        if (apiKey && apiKey.length > 10) {
          const client = new HumeWebSocketClient(apiKey);
          await client.connect();
          setHumeClient(client);
          console.log("✅ Hume WebSocket client connected");
        } else {
          console.warn("⚠️ Hume API key not found");
          setHumeClient(null);
        }
      } catch (error) {
        console.error("❌ Failed to initialize Hume WebSocket:", error);
        setHumeClient(null);
      }
    };

    initHumeClient();

    return () => {
      if (humeClient) {
        humeClient.disconnect();
      }
    };
  }, []);

  // Start webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraStarted(true);
        setSessionData([]);
        console.log("Camera started successfully");
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      alert("Failed to access camera. Please ensure camera permissions are granted.");
    }
  };

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsCameraStarted(false);
      console.log("Camera stopped");
    }
  }, []);

  // Real-time facial analysis
  const analyzeFacial = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      if (humeClient) {
        canvas.toBlob(
          async (blob) => {
            if (!blob) return;

            try {
              const result = await humeClient.analyzeImage(blob);
              if (result && Array.isArray(result) && result.length > 0) {
                const sortedEmotions = result.sort((a, b) => b.score - a.score);
                setFacialEmotions(sortedEmotions);

                const newEmotionData = {
                  timestamp: new Date().toISOString(),
                  facial: sortedEmotions,
                };
                setSessionData((prev) => [...prev, newEmotionData]);
              }
            } catch (apiError) {
              console.error("Hume API error:", apiError);
            }
          },
          "image/jpeg",
          0.8
        );
      } else {
        // Mock data for development
        const allEmotions = [
          "joy", "amusement", "excitement", "calmness", "surprise",
          "concentration", "boredom", "confusion", "interest", "contentment"
        ];

        const timeVariation = Math.sin(Date.now() / 1000) * 0.4;
        const randomVariation = (Math.random() - 0.5) * 0.6;

        const mockEmotions = allEmotions
          .map((emotion) => {
            let baseScore = 0.02;
            if (emotion === "joy" || emotion === "amusement") {
              baseScore = 0.5 + Math.abs(timeVariation) + randomVariation;
            } else if (emotion === "calmness") {
              baseScore = 0.4 + Math.abs(timeVariation * 0.8);
            } else if (emotion === "concentration") {
              baseScore = 0.3 + Math.abs(randomVariation * 0.5);
            }
            return {
              name: emotion,
              score: Math.max(0, Math.min(1, baseScore)),
            };
          })
          .sort((a, b) => b.score - a.score);

        setFacialEmotions(mockEmotions);
      }
    } catch (error) {
      console.error("Facial analysis error:", error);
    }
  }, [humeClient]);

  // Auto-analyze facial expressions when webcam is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === "facial" && isCameraStarted && videoRef.current?.srcObject) {
      interval = setInterval(analyzeFacial, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, isCameraStarted, analyzeFacial]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
      if (humeClient) {
        humeClient.disconnect();
      }
    };
  }, [stopWebcam, humeClient]);

  // Analyze text with enhanced AI analysis
  const analyzeText = async () => {
    if (!textInput.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/text-emotion-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: textInput }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setTextAnalysisResult(data);
      setMessageCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error analyzing text:", error);
      alert("Failed to analyze text. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Transform emotional metrics for radar chart
  const getRadarChartData = () => {
    if (!textAnalysisResult) return [];

    const metrics = textAnalysisResult.emotionalMetrics;
    return [
      { metric: "Intensity", value: metrics.intensity, fullMark: 100 },
      { metric: "Positivity", value: metrics.positivity, fullMark: 100 },
      { metric: "Authenticity", value: metrics.authenticity, fullMark: 100 },
      { metric: "Complexity", value: metrics.complexity, fullMark: 100 },
      { metric: "Clarity", value: metrics.clarity, fullMark: 100 },
      { metric: "Energy", value: metrics.energy, fullMark: 100 },
    ];
  };

  const getSentimentColor = (label: string) => {
    switch (label.toLowerCase()) {
      case "positive": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "negative": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "mixed": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent.toLowerCase()) {
      case "inform": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "persuade": return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      case "express": return "text-pink-400 bg-pink-400/10 border-pink-400/20";
      case "request": return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";
      case "question": return "text-indigo-400 bg-indigo-400/10 border-indigo-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const getTopEmotions = (emotions: EmotionScore[] = [], limit = 5) => {
    return emotions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .filter((emotion) => emotion.score > 0.1);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Modern Animated Tab Navigation */}
      <div className="flex justify-center mb-12">
        <div className="relative inline-flex bg-[#1a1d2e] border border-white/10 rounded-2xl p-1.5 gap-1.5">
          {/* Animated Background */}
          <motion.div
            className="absolute top-1.5 bottom-1.5 bg-secondary rounded-xl shadow-lg shadow-secondary/20"
            initial={false}
            animate={{
              left: activeTab === "facial" ? "6px" : "calc(50% + 0.75px)",
              width: "230px",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          />
          
          {/* Facial Tab */}
          <button
            onClick={() => setActiveTab("facial")}
            className="relative z-10 flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl transition-all duration-200 w-[230px]"
          >
            <motion.div
              animate={{
                scale: activeTab === "facial" ? 1 : 0.95,
              }}
              transition={{ duration: 0.2 }}
            >
              <LuCamera 
                size={20} 
                className={activeTab === "facial" ? "text-black" : "text-gray-500"}
              />
            </motion.div>
            <motion.span
              className="font-semibold text-base whitespace-nowrap"
              animate={{
                color: activeTab === "facial" ? "#000000" : "#6B7280",
              }}
              transition={{ duration: 0.2 }}
            >
              Facial Expressions
            </motion.span>
          </button>
          
          {/* Text Tab */}
          <button
            onClick={() => setActiveTab("text")}
            className="relative z-10 flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl transition-all duration-200 w-[230px]"
          >
            <motion.div
              animate={{
                scale: activeTab === "text" ? 1 : 0.95,
              }}
              transition={{ duration: 0.2 }}
            >
              <LuType 
                size={20}
                className={activeTab === "text" ? "text-black" : "text-gray-500"}
              />
            </motion.div>
            <motion.span
              className="font-semibold text-base whitespace-nowrap"
              animate={{
                color: activeTab === "text" ? "#000000" : "#6B7280",
              }}
              transition={{ duration: 0.2 }}
            >
              Text Analysis
            </motion.span>
          </button>
        </div>
      </div>

      {/* Facial Expression Tab */}
      {activeTab === "facial" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Facial Expression Analysis</h3>
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-64 bg-gray-800 rounded-lg object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={startWebcam}
                  disabled={isCameraStarted}
                  className="group relative overflow-hidden bg-black border border-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-white hover:text-black hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <LuPlay size={18} />
                    Start Camera
                  </span>
                </button>
                <button
                  onClick={stopWebcam}
                  disabled={!isCameraStarted}
                  className="group relative overflow-hidden bg-gray-800 border border-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <LuSquare size={18} />
                    Stop Camera
                  </span>
                </button>
              </div>
              <p className="text-sm text-gray-400">
                Real-time emotion analysis powered by Hume AI
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${
                  humeClient ? "bg-green-500" : "bg-yellow-500"
                }`}
              ></div>
              <h3 className="text-xl font-semibold">
                {humeClient ? "Connected to Hume AI" : "Mock Mode"}
              </h3>
            </div>

            {facialEmotions.length > 0 ? (
              <>
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-3">Top Expressions</h4>
                  <div className="space-y-2">
                    {getTopEmotions(facialEmotions, 3).map((emotion, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="capitalize font-medium">{emotion.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                index === 0
                                  ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                                  : index === 1
                                  ? "bg-gradient-to-r from-blue-400 to-cyan-400"
                                  : "bg-gradient-to-r from-purple-400 to-pink-400"
                              }`}
                              style={{ width: `${emotion.score * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium font-mono">
                            {emotion.score.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-3">Expression Levels</h4>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {facialEmotions.slice(0, 12).map((emotion, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between hover:bg-gray-800/50 rounded px-2 py-1"
                      >
                        <span className="capitalize text-sm">{emotion.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${emotion.score * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-8 font-mono">
                            {emotion.score.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <LuCamera className="text-gray-600 mx-auto mb-4" size={48} />
                <p className="text-gray-400">
                  Start your camera to see facial expression analysis
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Text Analysis Tab */}
      {activeTab === "text" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <LuType className="text-secondary" size={24} />
                Text Emotion Analysis
              </h3>
              <div className="space-y-4">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter text to analyze emotional language, sentiment, and intent...&#10;&#10;Example: 'I'm really excited about this new project! It's going to be challenging, but I think we can make something amazing together.'"
                  className="w-full h-40 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-secondary/50 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      analyzeText();
                    }
                  }}
                />
                <button
                  onClick={analyzeText}
                  disabled={!textInput.trim() || isAnalyzing}
                  className="group relative overflow-hidden bg-secondary text-black px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed w-full flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <LuBrain size={18} />
                      Analyze Text
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-400">
                  Powered by Hume AI & OpenAI GPT-5 • 53 emotional dimensions + sentiment & intent
                </p>
                {messageCount > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>{messageCount} analysis completed</span>
                  </div>
                )}
              </div>
            </div>

            {textAnalysisResult && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Sentiment</h4>
                    <div
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border mb-2 ${getSentimentColor(
                        textAnalysisResult.sentiment.label
                      )}`}
                    >
                      {textAnalysisResult.sentiment.label.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-secondary to-purple-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${textAnalysisResult.sentiment.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        {textAnalysisResult.sentiment.confidence}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {textAnalysisResult.sentiment.description}
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Intent</h4>
                    <div
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border mb-2 ${getIntentColor(
                        textAnalysisResult.intent.primary
                      )}`}
                    >
                      {textAnalysisResult.intent.primary.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${textAnalysisResult.intent.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        {textAnalysisResult.intent.confidence}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {textAnalysisResult.intent.description}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-3">Emotional Analysis</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {textAnalysisResult.analysis}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-6">
            {textAnalysisResult ? (
              <>
                <div className="bg-gray-900 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-6 text-center">Emotional Metrics</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={getRadarChartData()}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: "#6B7280", fontSize: 10 }}
                      />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#9d88ff"
                        fill="#9d88ff"
                        fillOpacity={0.6}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {getRadarChartData().map((item) => (
                      <div key={item.metric} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{item.metric}</span>
                        <span className="font-semibold text-secondary">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Emotional Language Results</h3>
                  <div className="space-y-3">
                    {textAnalysisResult.emotions.slice(0, 8).map((emotion, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between hover:bg-gray-800/50 rounded-lg px-3 py-2 transition-colors"
                      >
                        <span className="capitalize font-medium">{emotion.name}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${
                                index === 0
                                  ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                                  : index === 1
                                  ? "bg-gradient-to-r from-emerald-400 to-cyan-400"
                                  : index === 2
                                  ? "bg-gradient-to-r from-blue-400 to-indigo-400"
                                  : "bg-gradient-to-r from-purple-400 to-pink-400"
                              }`}
                              style={{ width: `${emotion.score * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-300 font-mono w-12 text-right">
                            {(emotion.score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-gray-900 rounded-lg p-12 text-center h-full flex flex-col items-center justify-center">
                <LuBrain className="text-secondary mx-auto mb-6" size={48} />
                <h3 className="text-xl font-semibold mb-2">AI-Powered Emotion Analysis</h3>
                <p className="text-gray-400 max-w-md">
                  Enter text to see comprehensive emotional analysis with sentiment, intent, and
                  53-dimensional emotion detection powered by Hume AI and OpenAI GPT-5.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <span className="text-xs px-3 py-1 bg-secondary/10 text-secondary rounded-full border border-secondary/20">
                    Hume AI
                  </span>
                  <span className="text-xs px-3 py-1 bg-secondary/10 text-secondary rounded-full border border-secondary/20">
                    OpenAI GPT-5
                  </span>
                  <span className="text-xs px-3 py-1 bg-secondary/10 text-secondary rounded-full border border-secondary/20">
                    53 Emotions
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
