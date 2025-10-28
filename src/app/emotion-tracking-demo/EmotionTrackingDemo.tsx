/* eslint-disable */
"use client";

import { useState } from "react";
import { LuType, LuSparkles } from "react-icons/lu";
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

interface AnalysisResult {
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

export function EmotionTrackingDemo() {
  const [textInput, setTextInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [messageCount, setMessageCount] = useState(0);

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
      setAnalysisResult(data);
      setMessageCount((prev) => prev + 1);
      console.log("Analysis results:", data);
    } catch (error) {
      console.error("Error analyzing text:", error);
      alert("Failed to analyze text. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Transform emotional metrics for radar chart
  const getRadarChartData = () => {
    if (!analysisResult) return [];

    const metrics = analysisResult.emotionalMetrics;
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
      case "positive":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "negative":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "mixed":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent.toLowerCase()) {
      case "inform":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "persuade":
        return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      case "express":
        return "text-pink-400 bg-pink-400/10 border-pink-400/20";
      case "request":
        return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";
      case "question":
        return "text-indigo-400 bg-indigo-400/10 border-indigo-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Text Input Section */}
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
                className="group relative overflow-hidden bg-secondary text-black px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-secondary w-full flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <LuSparkles size={18} />
                    Analyze Text
                  </>
                )}
              </button>
              <p className="text-sm text-gray-400">
                Powered by Hume AI & OpenAI GPT-4 • Analyzing emotional language
                across 53 dimensions, plus sentiment & intent detection
              </p>
              {messageCount > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>{messageCount} analysis completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Sentiment & Intent Cards */}
          {analysisResult && (
            <div className="grid grid-cols-2 gap-4">
              {/* Sentiment Card */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  Sentiment
                </h4>
                <div
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border mb-2 ${getSentimentColor(
                    analysisResult.sentiment.label
                  )}`}
                >
                  {analysisResult.sentiment.label.toUpperCase()}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-secondary to-purple-400 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${analysisResult.sentiment.confidence}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {analysisResult.sentiment.confidence}%
                    </span>
                </div>
                <p className="text-xs text-gray-400">
                  {analysisResult.sentiment.description}
                </p>
              </div>

              {/* Intent Card */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  Intent
                </h4>
                <div
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border mb-2 ${getIntentColor(
                    analysisResult.intent.primary
                  )}`}
                >
                  {analysisResult.intent.primary.toUpperCase()}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${analysisResult.intent.confidence}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {analysisResult.intent.confidence}%
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {analysisResult.intent.description}
                </p>
              </div>
            </div>
          )}

          {/* Detailed Analysis */}
          {analysisResult && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-3">
                Emotional Analysis
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {analysisResult.analysis}
              </p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {analysisResult ? (
            <>
              {/* Radar Chart */}
            <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-6 text-center">
                  Emotional Metrics
                </h3>
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
                    <div
                      key={item.metric}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-400">{item.metric}</span>
                      <span className="font-semibold text-secondary">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Emotions */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Emotional Language Results
                </h3>
                <div className="space-y-3">
                  {analysisResult.emotions.slice(0, 8).map((emotion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between group hover:bg-gray-800/50 rounded-lg px-3 py-2 transition-colors"
                    >
                      <span className="capitalize font-medium">
                        {emotion.name}
                      </span>
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
              <div className="mb-6">
                <LuSparkles className="text-secondary mx-auto" size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                AI-Powered Emotion Analysis
              </h3>
              <p className="text-gray-400 max-w-md">
                Enter text on the left to see comprehensive emotional analysis
                including sentiment, intent, and 53-dimensional emotion detection
                powered by Hume AI and OpenAI GPT-4.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <span className="text-xs px-3 py-1 bg-secondary/10 text-secondary rounded-full border border-secondary/20">
                  Hume AI
                </span>
                <span className="text-xs px-3 py-1 bg-secondary/10 text-secondary rounded-full border border-secondary/20">
                  OpenAI GPT-4
                </span>
                <span className="text-xs px-3 py-1 bg-secondary/10 text-secondary rounded-full border border-secondary/20">
                  53 Emotions
                </span>
                <span className="text-xs px-3 py-1 bg-secondary/10 text-secondary rounded-full border border-secondary/20">
                  Sentiment Analysis
                </span>
                <span className="text-xs px-3 py-1 bg-secondary/10 text-secondary rounded-full border border-secondary/20">
                  Intent Detection
                      </span>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
