# CareBridge Vercel Demo

This folder is ready to deploy as a Vercel demo.

## What Runs Where

- React/Vite frontend runs in the browser.
- `/api/triage` runs as a Vercel Serverless Function.
- The serverless function calls the hosted Gemma 4 API.
- Gemma 4 extracts structured JSON only.
- The deterministic CTAS-aligned rule engine assigns the final triage level.

## Required Vercel Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

```text
GOOGLE_API_KEY=your_google_ai_studio_key
GEMMA_MODEL=gemma-4-26b-a4b-it
```

Do not use `VITE_GOOGLE_API_KEY`. Anything beginning with `VITE_` is exposed to the browser.

## Local Commands

```bash
npm install
npm run build
```

For local Vercel-style API testing:

```bash
npm i -g vercel
vercel dev
```

Then open:

```text
http://localhost:3000
```

## Demo Safety Note

The Vercel version is a public hackathon demo mode. Use synthetic demo cases only.
The real privacy story remains the local/Ollama deployment mode, where patient data does not leave the clinic device.
