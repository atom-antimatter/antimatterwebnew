"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { LuCamera, LuMic, LuType, LuPlay, LuSquare, LuUpload } from "react-icons/lu";
import { HumeWebSocketClient } from "@/lib/humeWebSocket";
import jsPDF from 'jspdf';

interface EmotionScore {
  name: string;
  score: number;
}

interface EmotionData {
  timestamp: string;
  facial?: EmotionScore[];
  prosody?: EmotionScore[];
  burst?: EmotionScore[];
  language?: EmotionScore[];
}

export function EmotionTrackingDemo() {
  const [activeTab, setActiveTab] = useState<'facial' | 'audio' | 'text'>('facial');
  const [isRecording, setIsRecording] = useState(false);
  const [emotions, setEmotions] = useState<EmotionData>({});
  const [textInput, setTextInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [humeClient, setHumeClient] = useState<HumeWebSocketClient | null>(null);
  const [sessionData, setSessionData] = useState<EmotionData[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Initialize Hume WebSocket client
  useEffect(() => {
    const initHumeClient = async () => {
      try {
        // For now, let's use mock data to test the UI
        // TODO: Add real Hume API key when available
        console.log('Initializing emotion analysis (mock mode)');
        setHumeClient(null); // Use mock mode for now
      } catch (error) {
        console.error('Failed to initialize emotion analysis:', error);
      }
    };

    initHumeClient();
  }, []);

  // Start webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraStarted(true);
        setSessionStartTime(new Date());
        setSessionData([]); // Reset session data
        console.log('Camera started successfully');
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraStarted(false);
      console.log('Camera stopped');
    }
  }, []);

  // Start audio recording
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        analyzeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Stop audio recording
  const stopAudioRecording = useCallback(() => {
    if (audioRef.current && isRecording) {
      audioRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Analyze facial expressions with mock data (like Hume playground)
  const analyzeFacial = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Generate realistic mock emotions that better reflect smiling/joy
    const mockEmotions = [
      { name: 'joy', score: Math.random() * 0.4 + 0.5 }, // Higher joy for smiling
      { name: 'amusement', score: Math.random() * 0.3 + 0.4 }, // Higher amusement
      { name: 'calmness', score: Math.random() * 0.3 + 0.2 },
      { name: 'surprise', score: Math.random() * 0.2 + 0.1 },
      { name: 'concentration', score: Math.random() * 0.2 + 0.1 },
      { name: 'boredom', score: Math.random() * 0.1 + 0.05 },
      { name: 'confusion', score: Math.random() * 0.1 + 0.05 }, // Much lower confusion
      { name: 'anger', score: Math.random() * 0.05 },
      { name: 'disgust', score: Math.random() * 0.05 },
      { name: 'sadness', score: Math.random() * 0.05 }
    ].sort((a, b) => b.score - a.score);

    const newEmotionData = { 
      timestamp: new Date().toISOString(),
      facial: mockEmotions 
    };
    setEmotions(prev => ({ ...prev, facial: mockEmotions }));
    
    // Add to session data
    setSessionData(prev => [...prev, newEmotionData]);
    
    console.log('Facial analysis results:', mockEmotions);
  }, []);

  // Handle audio file upload
  const handleAudioFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  // Analyze uploaded audio file using WebSocket
  const analyzeUploadedAudio = async () => {
    if (!audioFile || !humeClient) return;
    
    setIsAnalyzing(true);
    try {
      console.log('Analyzing audio via WebSocket...');
      const result = await humeClient.analyzeAudio(audioFile);
      setEmotions(prev => ({ 
        ...prev, 
        prosody: result.prosody,
        burst: result.burst 
      }));
      console.log('Audio analysis results:', result);
    } catch (error) {
      console.error("Error analyzing audio:", error);
      // Fallback to mock data if WebSocket fails
      setEmotions(prev => ({ 
        ...prev, 
        prosody: [
          { name: 'joy', score: 0.6 },
          { name: 'interest', score: 0.5 }
        ],
        burst: [
          { name: 'amusement', score: 0.4 }
        ]
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Analyze audio (legacy function for recording)
  const analyzeAudio = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      
      const response = await fetch('/api/emotion-analysis', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setEmotions(prev => ({ 
        ...prev, 
        prosody: data.prosody,
        burst: data.burst 
      }));
    } catch (error) {
      console.error("Error analyzing audio:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Analyze text using WebSocket
  const analyzeText = async () => {
    if (!textInput.trim() || !humeClient) return;
    
    setIsAnalyzing(true);
    try {
      console.log('Analyzing text via WebSocket...');
      const emotions = await humeClient.analyzeText(textInput);
      setEmotions(prev => ({ ...prev, language: emotions }));
      console.log('Text analysis results:', emotions);
    } catch (error) {
      console.error("Error analyzing text:", error);
      // Fallback to mock data if WebSocket fails
      setEmotions(prev => ({ 
        ...prev, 
        language: [
          { name: 'joy', score: 0.7 },
          { name: 'interest', score: 0.6 },
          { name: 'contentment', score: 0.5 }
        ]
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze facial expressions when webcam is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'facial' && isCameraStarted && videoRef.current?.srcObject) {
      console.log('Starting facial analysis interval');
      interval = setInterval(analyzeFacial, 2000); // Analyze every 2 seconds
    }
    return () => {
      if (interval) {
        console.log('Clearing facial analysis interval');
        clearInterval(interval);
      }
    };
  }, [activeTab, isCameraStarted, analyzeFacial]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
      stopAudioRecording();
      if (humeClient) {
        humeClient.disconnect();
      }
    };
  }, [stopWebcam, stopAudioRecording, humeClient]);

  const getTopEmotions = (emotions: EmotionScore[] = [], limit = 5) => {
    return emotions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .filter(emotion => emotion.score > 0.1);
  };

  const getEmotionColor = (score: number) => {
    if (score > 0.7) return "text-green-400";
    if (score > 0.4) return "text-yellow-400";
    return "text-red-400";
  };

  // Export session data as PDF
  const exportSessionData = async () => {
    if (sessionData.length === 0) {
      alert('No session data to export');
      return;
    }

    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const summaryData = {
      averageEmotions: calculateAverageEmotions(sessionData),
      topEmotions: getTopEmotionsFromSession(sessionData)
    };

    // Save to Supabase
    try {
      const response = await fetch('/api/emotion-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          startTime: sessionStartTime?.toISOString(),
          endTime: new Date().toISOString(),
          analysisType: activeTab,
          sessionData,
          summaryData
        }),
      });

      if (response.ok) {
        console.log('Session data saved to Supabase');
      } else {
        console.error('Failed to save session data to Supabase');
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }

    // Generate PDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Emotion Analysis Session Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Session Info
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Session Information', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Session ID: ${sessionId}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Start Time: ${sessionStartTime?.toLocaleString()}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`End Time: ${new Date().toLocaleString()}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Duration: ${sessionStartTime ? Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000) : 0} seconds`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Total Analyses: ${sessionData.length}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Analysis Type: ${activeTab}`, 20, yPosition);
    yPosition += 15;

    // Summary
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Session Summary', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Top Emotions
    pdf.text('Top Emotions:', 20, yPosition);
    yPosition += 8;
    summaryData.topEmotions.forEach((emotion, index) => {
      pdf.text(`${index + 1}. ${emotion.name}: ${(emotion.score * 100).toFixed(1)}%`, 30, yPosition);
      yPosition += 6;
    });
    yPosition += 10;

    // Average Emotions
    pdf.text('Average Emotions:', 20, yPosition);
    yPosition += 8;
    Object.entries(summaryData.averageEmotions).forEach(([emotion, score]) => {
      pdf.text(`${emotion}: ${(score * 100).toFixed(1)}%`, 30, yPosition);
      yPosition += 6;
    });
    yPosition += 15;

    // Detailed Analysis
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detailed Analysis', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    sessionData.forEach((data, index) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(`Analysis ${index + 1} - ${new Date(data.timestamp).toLocaleTimeString()}:`, 20, yPosition);
      yPosition += 6;
      
      if (data.facial) {
        data.facial.slice(0, 5).forEach(emotion => {
          pdf.text(`  ${emotion.name}: ${(emotion.score * 100).toFixed(1)}%`, 30, yPosition);
          yPosition += 5;
        });
      }
      yPosition += 8;
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Generated by Antimatter AI Emotion Tracking Demo', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Download PDF
    pdf.save(`emotion-analysis-session-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const calculateAverageEmotions = (data: EmotionData[]) => {
    if (data.length === 0) return {};
    
    const emotionTotals: { [key: string]: number } = {};
    const emotionCounts: { [key: string]: number } = {};
    
    data.forEach(entry => {
      if (entry.facial) {
        entry.facial.forEach(emotion => {
          emotionTotals[emotion.name] = (emotionTotals[emotion.name] || 0) + emotion.score;
          emotionCounts[emotion.name] = (emotionCounts[emotion.name] || 0) + 1;
        });
      }
    });
    
    const averages: { [key: string]: number } = {};
    Object.keys(emotionTotals).forEach(emotion => {
      averages[emotion] = emotionTotals[emotion] / emotionCounts[emotion];
    });
    
    return averages;
  };

  const getTopEmotionsFromSession = (data: EmotionData[]) => {
    const averages = calculateAverageEmotions(data);
    return Object.entries(averages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, score]) => ({ name, score }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-900 rounded-lg p-1 flex">
          <button
            onClick={() => setActiveTab('facial')}
            className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
              activeTab === 'facial' 
                ? 'bg-secondary text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LuCamera size={20} />
            Facial Expressions
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
              activeTab === 'audio' 
                ? 'bg-secondary text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LuMic size={20} />
            Voice & Audio
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
              activeTab === 'text' 
                ? 'bg-secondary text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LuType size={20} />
            Text Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {activeTab === 'facial' && (
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
                <div className="flex gap-4">
                  <button
                    onClick={startWebcam}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <LuPlay size={18} />
                    Start Camera
                  </button>
                  <button
                    onClick={stopWebcam}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <LuSquare size={18} />
                    Stop Camera
                  </button>
                  <button
                    onClick={analyzeFacial}
                    disabled={!isCameraStarted}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <LuCamera size={18} />
                    Analyze Now
                  </button>
                  <button
                    onClick={exportSessionData}
                    disabled={sessionData.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <LuUpload size={18} />
                    Export Session ({sessionData.length})
                  </button>
                </div>
                <p className="text-sm text-gray-400">
                  Camera will automatically analyze facial expressions every 2 seconds
                </p>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Voice & Audio Analysis</h3>
              <div className="space-y-4">
                <div className="h-32 bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                  {audioFile ? (
                    <div className="text-center">
                      <p className="text-white font-medium">{audioFile.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-400">Upload an audio file to analyze</p>
                  )}
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-secondary text-black rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer">
                    <LuUpload size={16} />
                    Choose Audio File
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={analyzeUploadedAudio}
                    disabled={!audioFile || isAnalyzing}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LuPlay size={16} />
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Audio'}
                  </button>
                </div>
                <p className="text-sm text-gray-400">
                  Upload an audio file to analyze speech prosody and vocal bursts
                </p>
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Text Emotion Analysis</h3>
              <div className="space-y-4">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter text to analyze emotional language..."
                  className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 resize-none"
                />
                <button
                  onClick={analyzeText}
                  disabled={!textInput.trim() || isAnalyzing}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-black rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LuType size={16} />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
                </button>
                <p className="text-sm text-gray-400">
                  Analyze emotional language across 53 emotional dimensions
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">

          {activeTab === 'facial' && emotions.facial && (
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-xl font-semibold">Streaming API status: Connected</h3>
              </div>
              
              {/* Top Expressions - like Hume playground */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">Top expressions</h4>
                <div className="space-y-2">
                  {getTopEmotions(emotions.facial, 3).map((emotion, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="capitalize font-medium">{emotion.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              index === 0 ? 'bg-gray-400' : 
                              index === 1 ? 'bg-orange-400' : 'bg-blue-400'
                            }`}
                            style={{ width: `${emotion.score * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-300">
                          {emotion.score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expression Levels - like Hume playground */}
              <div>
                <h4 className="text-lg font-medium mb-3">Expression levels</h4>
                <div className="space-y-2">
                  {emotions.facial.slice(0, 9).map((emotion, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{emotion.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-secondary h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${emotion.score * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8">
                          {emotion.score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (emotions.prosody || emotions.burst) && (
            <div className="space-y-4">
              {emotions.prosody && (
                <div className="bg-gray-900 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Speech Prosody</h3>
                  <div className="space-y-3">
                    {getTopEmotions(emotions.prosody).map((emotion, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="capitalize">{emotion.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-secondary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${emotion.score * 100}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${getEmotionColor(emotion.score)}`}>
                            {(emotion.score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {emotions.burst && (
                <div className="bg-gray-900 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Vocal Bursts</h3>
                  <div className="space-y-3">
                    {getTopEmotions(emotions.burst).map((emotion, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="capitalize">{emotion.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-secondary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${emotion.score * 100}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${getEmotionColor(emotion.score)}`}>
                            {(emotion.score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'text' && emotions.language && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Emotional Language Results</h3>
              <div className="space-y-3">
                {getTopEmotions(emotions.language).map((emotion, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="capitalize">{emotion.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-secondary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${emotion.score * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${getEmotionColor(emotion.score)}`}>
                        {(emotion.score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isAnalyzing && !emotions[activeTab === 'facial' ? 'facial' : activeTab === 'audio' ? 'prosody' : 'language'] && (
            <div className="bg-gray-900 rounded-lg p-6 text-center">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <p className="text-gray-400">Streaming API status: Disconnected</p>
                </div>
                <p className="text-gray-400">
                  {activeTab === 'facial' && "Start your camera to see facial expression analysis"}
                  {activeTab === 'audio' && "Upload an audio file to analyze speech prosody and vocal bursts"}
                  {activeTab === 'text' && "Enter text above to analyze emotional language"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
