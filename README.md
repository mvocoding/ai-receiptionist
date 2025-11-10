# Gemini Live Chat

A minimal React application for real-time chat with Google Gemini using the Live API.

## Features

- Real-time text chat with Gemini
- Simple, clean UI with Tailwind CSS
- WebSocket-based Live API connection
- No unnecessary dependencies

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

4. Enter your Gemini API key and click "Connect" to start chatting

## Get Your API Key

Get your free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

## Project Structure

```
src/
  components/
    LiveGemini.tsx    # Main chat component
  lib/
    genai-live-client.ts  # WebSocket client wrapper
  App.tsx             # Root component
  index.tsx           # Entry point
  index.css           # Tailwind styles
```

## Dependencies

- `@google/genai` - Google Gemini SDK
- `react` & `react-dom` - React framework
- `eventemitter3` - Event handling
- `tailwindcss` - Styling
