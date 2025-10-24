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
      const wsUrl = `wss://api.hume.ai/v0/stream/models?apiKey=${this.apiKey}`;
      
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('Hume WebSocket connected');
        this.isConnected = true;
        resolve();
      };
      
      this.socket.onerror = (error) => {
        console.error('Hume WebSocket error:', error);
        this.isConnected = false;
        reject(error);
      };
      
      this.socket.onclose = () => {
        console.log('Hume WebSocket disconnected');
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
          
          const message = {
            models: {
              face: {}
            },
            data: base64Data
          };

          const messageHandler = (event: MessageEvent) => {
            try {
              const response: HumeWebSocketResponse = JSON.parse(event.data);
              
              if (response.face?.predictions?.[0]?.emotions) {
                this.socket?.removeEventListener('message', messageHandler);
                resolve(response.face.predictions[0].emotions);
              }
            } catch (error) {
              console.error('Error parsing WebSocket response:', error);
              this.socket?.removeEventListener('message', messageHandler);
              reject(error);
            }
          };

          this.socket?.addEventListener('message', messageHandler);
          this.socket?.send(JSON.stringify(message));
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
