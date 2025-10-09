# Voice Agent Setup Guide

This guide will help you set up the Antimatter AI Voice Agent powered by OpenAI's Realtime API.

## Prerequisites

- OpenAI API account with access to the Realtime API
- Node.js 20+
- Next.js 15+

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Set the organization ID if you have one
# OPENAI_ORG_ID=your_org_id_here
```

### Getting Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

**Important:** The Realtime API requires a paid OpenAI account. Make sure your account has access to `gpt-4o-realtime-preview-2024-12-17` model.

## How It Works

### Architecture

1. **Client-Side (VoiceAgentDemo.tsx)**
   - Uses WebRTC for real-time audio communication
   - Manages peer connection with OpenAI's Realtime API
   - Handles microphone input and audio output
   - Displays 3D sphere visualization that reacts to speech

2. **API Route (/api/voice-agent-token)**
   - Generates ephemeral tokens for secure client-side connections
   - Communicates with OpenAI to create session credentials
   - Returns client secret for WebRTC connection

3. **3D Sphere (VoiceAgent3DSphere.tsx)**
   - Three.js-powered particle system
   - Oscillates and reacts when AI is speaking
   - Provides visual feedback during conversation

4. **System Prompt (voiceAgentPrompt.ts)**
   - Comprehensive knowledge base about Antimatter AI
   - Includes services, case studies, team info
   - Personality: "Atom" - Antimatter's friendly AI assistant

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
- **Natural language understanding** via GPT-4o
- **3D visualization** that reacts to speech
- **Mute/unmute** functionality
- **Call duration tracking**
- **Error handling** with user-friendly messages

## Troubleshooting

### "Failed to get session token"
- Check that your `OPENAI_API_KEY` is set correctly in `.env.local`
- Verify your OpenAI account has access to the Realtime API
- Restart your development server after adding the API key

### "Failed to connect to voice agent"
- Ensure your browser supports WebRTC (Chrome, Firefox, Safari)
- Check that microphone permissions are granted
- Verify you have a stable internet connection

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

In `/src/app/api/voice-agent-token/route.ts`, modify the `voice` parameter:
- Options: "alloy", "echo", "fable", "onyx", "nova", "shimmer", "verse"

### Adjust 3D Sphere

In `/src/components/VoiceAgent3DSphere.tsx`:
- Particle count: `particleCount` variable
- Sphere radius: `radius` variable
- Colors: `baseColor` and `activeColor`
- Oscillation speed: `time` increment value

## API Costs

The OpenAI Realtime API charges per audio minute:
- Input audio: $0.06 / minute
- Output audio: $0.24 / minute

Monitor your usage in the [OpenAI Dashboard](https://platform.openai.com/usage).

## Security Notes

- Never commit `.env.local` to version control
- API keys are kept server-side
- Ephemeral tokens expire after the session
- WebRTC connections are encrypted end-to-end

## Support

For issues or questions about the voice agent implementation:
- Check the browser console for error messages
- Review the OpenAI Realtime API docs: https://platform.openai.com/docs/models/gpt-realtime
- Contact the Antimatter AI team at clients@antimatterai.com

