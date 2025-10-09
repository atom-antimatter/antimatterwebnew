# Voice Agent Setup Guide

This guide will help you set up the Antimatter AI Voice Agent powered by Hume's Empathic Voice Interface (EVI).

## Prerequisites

- Hume AI API account
- Node.js 20+
- Next.js 15+

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```bash
# Hume AI API Configuration
HUME_API_KEY=your_hume_api_key_here
HUME_SECRET_KEY=your_hume_secret_key_here
```

### Getting Your Hume API Credentials

1. Go to [Hume AI Platform](https://platform.hume.ai/)
2. Sign in to your account
3. Navigate to API Keys section
4. Create a new API key and secret key
5. Copy both keys and add them to your `.env.local` file

**Important:** Keep your secret key secure and never commit it to version control.

## How It Works

### Architecture

1. **Client-Side (VoiceAgentDemo.tsx)**
   - Uses WebSocket for real-time audio communication
   - Manages connection with Hume's EVI API
   - Handles microphone input and audio output playback
   - Displays 3D sphere visualization that reacts to speech

2. **API Route (/api/voice-agent-token)**
   - Generates OAuth2 access tokens for secure client-side connections
   - Communicates with Hume's authentication API
   - Returns access token for WebSocket connection

3. **3D Sphere (VoiceAgent3DSphere.tsx)**
   - Three.js-powered particle system
   - Oscillates and reacts when AI is speaking
   - Provides visual feedback during conversation

4. **System Prompt (voiceAgentPrompt.ts)**
   - Comprehensive knowledge base about Antimatter AI
   - Includes services, case studies, team info
   - Personality: "Atom" - Antimatter's empathetic AI assistant
   - Trained on Antimatter website content and team LinkedIn profiles

### System Prompt Details

Atom knows about:
- All Antimatter AI services (Design, Development, GTM, Healthcare, AI, IoT, Voice Agents)
- Case studies (ClinixAI, Synergies4, CureHire, OWASP, Feature)
- Team members (Matt Bravo, Paul Wallace) with LinkedIn profiles
- Company statistics and capabilities
- When to refer users to schedule meetings with the team

## Usage

1. Navigate to `/voice-agent-demo`
2. Click "Start Conversation"
3. Allow microphone access when prompted
4. Start talking with Atom!

### Example Questions

- "Tell me about Antimatter AI's services"
- "What is ClinixAI?"
- "Who are Matt and Paul?"
- "Can you help me with a healthcare app project?"
- "What tech stack do you use?"

## Features

- **Real-time voice conversations** with low latency
- **Empathic AI** via Hume's emotion-aware language models
- **3D visualization** that reacts to speech
- **Mute/unmute** functionality
- **Call duration tracking**
- **Real-time transcript** with speaker identification
- **Error handling** with user-friendly messages

## Troubleshooting

### "Failed to get access token"
- Check that both `HUME_API_KEY` and `HUME_SECRET_KEY` are set correctly in `.env.local`
- Verify your Hume account is active and has API access
- Restart your development server after adding the API keys

### "Failed to connect to voice agent"
- Ensure your browser supports WebSocket (Chrome, Firefox, Safari)
- Check that microphone permissions are granted
- Verify you have a stable internet connection
- Check browser console for detailed error messages

### No audio output
- Check your browser's audio settings
- Ensure your speakers/headphones are connected
- Try refreshing the page

### Sphere not oscillating
- Check browser console for Three.js errors
- Ensure the texture file exists at `/public/images/glowingCircle2.png`
- Verify WebGL support in your browser

## Customization

### Modify Atom's Personality

Edit `/src/lib/voiceAgentPrompt.ts` to change:
- Tone and personality
- Available information
- When to refer to the team
- Conversation guidelines

### Change Voice

Hume EVI uses emotionally expressive voices. Voice selection is configured during session setup in the WebSocket connection.

### Adjust 3D Sphere

In `/src/components/VoiceAgent3DSphere.tsx`:
- Particle count: `particleCount` variable
- Sphere radius: `radius` variable
- Colors: `baseColor` and `activeColor`
- Oscillation speed: `time` increment value

## API Costs

Hume EVI charges based on usage. Check the [Hume Pricing Page](https://hume.ai/pricing) for current rates.

Monitor your usage in the [Hume Dashboard](https://platform.hume.ai/).

## Security Notes

- Never commit `.env.local` to version control
- API credentials are kept server-side
- Access tokens are short-lived and expire automatically
- WebSocket connections use secure WSS protocol
- Audio data is encrypted in transit

## Support

For issues or questions about the voice agent implementation:
- Check the browser console for error messages
- Review the Hume EVI docs: https://docs.hume.ai/
- Contact the Antimatter AI team at clients@antimatterai.com

