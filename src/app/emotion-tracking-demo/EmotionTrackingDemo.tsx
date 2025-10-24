"use client";

import { useState, useRef, useEffect } from "react";
import { LuCamera, LuMic, LuType, LuPlay, LuSquare } from "react-icons/lu";

interface EmotionScore {
  name: string;
  score: number;
}

interface EmotionData {
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

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
  const stopAudioRecording = () => {
    if (audioRef.current && isRecording) {
      audioRef.current.stop();
      setIsRecording(false);
    }
  };

  // Analyze facial expressions
  const analyzeFacial = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      setIsAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append('file', blob, 'face.jpg');
        
        const response = await fetch('/api/emotion-analysis', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        setEmotions(prev => ({ ...prev, facial: data.facial }));
      } catch (error) {
        console.error("Error analyzing facial expressions:", error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 'image/jpeg', 0.8);
  };

  // Analyze audio
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

  // Analyze text
  const analyzeText = async () => {
    if (!textInput.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/emotion-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
      });
      
      const data = await response.json();
      setEmotions(prev => ({ ...prev, language: data.language }));
    } catch (error) {
      console.error("Error analyzing text:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze facial expressions when webcam is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'facial' && videoRef.current?.srcObject) {
      interval = setInterval(analyzeFacial, 2000); // Analyze every 2 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
      stopAudioRecording();
    };
  }, []);

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
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-black rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    <LuPlay size={16} />
                    Start Camera
                  </button>
                  <button
                    onClick={stopWebcam}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <LuSquare size={16} />
                    Stop Camera
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
                <div className="h-32 bg-gray-800 rounded-lg flex items-center justify-center">
                  {isRecording ? (
                    <div className="text-center">
                      <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse mx-auto mb-2"></div>
                      <p className="text-red-400">Recording...</p>
                    </div>
                  ) : (
                    <p className="text-gray-400">Click record to analyze your voice</p>
                  )}
                </div>
                <button
                  onClick={isRecording ? stopAudioRecording : startAudioRecording}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isRecording 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-secondary text-black hover:bg-secondary/80'
                  }`}
                >
                  {isRecording ? <LuSquare size={16} /> : <LuPlay size={16} />}
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
                <p className="text-sm text-gray-400">
                  Record your voice to analyze speech prosody and vocal bursts
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
          {isAnalyzing && (
            <div className="bg-gray-900 rounded-lg p-6 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-secondary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Analyzing emotions...</p>
            </div>
          )}

          {activeTab === 'facial' && emotions.facial && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Facial Expression Results</h3>
              <div className="space-y-3">
                {getTopEmotions(emotions.facial).map((emotion, index) => (
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
                    )))}
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
              <p className="text-gray-400">
                {activeTab === 'facial' && "Start your camera to see facial expression analysis"}
                {activeTab === 'audio' && "Record your voice to analyze speech prosody and vocal bursts"}
                {activeTab === 'text' && "Enter text above to analyze emotional language"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
