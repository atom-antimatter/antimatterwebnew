interface EmotionScore {
  name: string;
  score: number;
}

interface HumeWebSocketResponse {
  face?: {
    predictions: Array<{
      emotions: EmotionScore[];
    }>;
  };
  language?: {
    predictions: Array<{
      emotions: EmotionScore[];
    }>;
  };
  prosody?: {
    predictions: Array<{
      emotions: EmotionScore[];
    }>;
  };
  burst?: {
    predictions: Array<{
      emotions: EmotionScore[];
    }>;
  };
}

export class HumeWebSocketClient {
  private socket: WebSocket | null = null;
  private apiKey: string;
  private isConnected = false;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Correct WebSocket URL with API key as query parameter (browser limitation)
      const wsUrl = `wss://api.hume.ai/v0/stream/models?apiKey=${this.apiKey}`;
      
      console.log('🔌 Connecting to Hume WebSocket:', wsUrl.replace(this.apiKey, '***'));
      
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('🔌 Hume WebSocket connected');
        this.isConnected = true;
        
        // Send initial configuration message with models
        const configMessage = {
          models: {
            face: {}
          }
        };
        
        this.socket?.send(JSON.stringify(configMessage));
        console.log('📤 Sent initial configuration:', configMessage);
        resolve();
      };
      
      this.socket.onerror = (error) => {
        console.error('❌ Hume WebSocket error:', error);
        this.isConnected = false;
        reject(error);
      };
      
      this.socket.onclose = (event) => {
        console.log('🔌 Hume WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
      };
    });
  }

  async analyzeImage(imageBlob: Blob): Promise<EmotionScore[]> {
    if (!this.socket || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          
          // Correct message format according to documentation
          const message = {
            data: base64Data
          };

          console.log('📤 Sending image data to Hume AI...');

          const messageHandler = (event: MessageEvent) => {
            try {
              const response: HumeWebSocketResponse = JSON.parse(event.data);
              console.log('📥 Received response from Hume AI:', response);
              
              if (response.face?.predictions?.[0]?.emotions) {
                this.socket?.removeEventListener('message', messageHandler);
                const emotions = response.face.predictions[0].emotions;
                console.log('🎯 Extracted emotions:', emotions);
                resolve(emotions);
              } else {
                console.warn('⚠️ No emotions found in response:', response);
                this.socket?.removeEventListener('message', messageHandler);
                reject(new Error('No emotions found in response'));
              }
            } catch (error) {
              console.error('❌ Error parsing response:', error);
              this.socket?.removeEventListener('message', messageHandler);
              reject(error);
            }
          };

          this.socket?.addEventListener('message', messageHandler);
          this.socket?.send(JSON.stringify(message));
          
          // Set timeout to prevent hanging
          setTimeout(() => {
            this.socket?.removeEventListener('message', messageHandler);
            reject(new Error('Timeout waiting for response'));
          }, 10000);
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read image file'));
        };
        
        reader.readAsDataURL(imageBlob);
    });
  }

  async analyzeText(text: string): Promise<EmotionScore[]> {
    if (!this.socket || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      const message = {
        models: {
          language: {}
        },
        raw_text: true,
        data: text
      };

      const messageHandler = (event: MessageEvent) => {
        try {
          const response: HumeWebSocketResponse = JSON.parse(event.data);
          
          if (response.language?.predictions?.[0]?.emotions) {
            this.socket?.removeEventListener('message', messageHandler);
            resolve(response.language.predictions[0].emotions);
          }
        } catch (error) {
          console.error('Error parsing WebSocket response:', error);
          this.socket?.removeEventListener('message', messageHandler);
          reject(error);
        }
      };

      this.socket?.addEventListener('message', messageHandler);
      this.socket?.send(JSON.stringify(message));
    });
  }

  async analyzeAudio(audioBlob: Blob): Promise<{ prosody: EmotionScore[], burst: EmotionScore[] }> {
    if (!this.socket || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:audio/wav;base64, prefix
        
        const message = {
          models: {
            prosody: {},
            burst: {}
          },
          data: base64Data
        };

        const messageHandler = (event: MessageEvent) => {
          try {
            const response: HumeWebSocketResponse = JSON.parse(event.data);
            
            const result: { prosody: EmotionScore[], burst: EmotionScore[] } = {
              prosody: [],
              burst: []
            };

            if (response.prosody?.predictions?.[0]?.emotions) {
              result.prosody = response.prosody.predictions[0].emotions;
            }

            if (response.burst?.predictions?.[0]?.emotions) {
              result.burst = response.burst.predictions[0].emotions;
            }

            this.socket?.removeEventListener('message', messageHandler);
            resolve(result);
          } catch (error) {
            console.error('Error parsing WebSocket response:', error);
            this.socket?.removeEventListener('message', messageHandler);
            reject(error);
          }
        };

        this.socket?.addEventListener('message', messageHandler);
        this.socket?.send(JSON.stringify(message));
      };
      
      reader.readAsDataURL(audioBlob);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }
}
