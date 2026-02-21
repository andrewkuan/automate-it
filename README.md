# ⚡ Automation Analyzer

Instantly evaluate whether a manual task is worth automating. Describe your repetitive workflow and get an AI-powered analysis with an automation score, effort/impact assessment, suggested tools, and a step-by-step workflow blueprint.

## Features

- **AI-Powered Analysis** — Submit a task description and receive a detailed automation feasibility report including an automation score, AI dependency percentage, biggest bottleneck, suggested approach, estimated build time, and recommended tools.
- **Voice Input** — Dictate task descriptions using the built-in microphone button powered by Deepgram speech-to-text transcription.
- **Effort vs Impact Matrix** — After analyzing 2+ tasks, visualize them on a scatter plot to prioritize which automations deliver the most value for the least effort.
- **Workflow Blueprint** — View a generated step-by-step workflow showing triggers, actions, conditions, and AI nodes required to automate the task.
- **Search History** — All analyzed tasks are saved locally so you can revisit and compare previous results.
- **Shareable Links** — Share an analysis via URL query parameter (`?task=...`) so others can instantly run the same evaluation.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Lovable Cloud (Edge Functions)
- **AI:** Codewords API (task analysis), Lovable AI Gateway (task summarization)
- **Speech-to-Text:** Deepgram Nova-2
- **Charts:** Recharts

## Project Structure

```
src/
├── components/
│   ├── AIBar.tsx              # AI interaction bar
│   ├── EffortImpactMatrix.tsx # Scatter plot for effort vs impact
│   ├── ResultCard.tsx         # Displays analysis results
│   ├── ScoreDial.tsx          # Circular score gauge
│   ├── SearchHistory.tsx      # Past analyses list
│   ├── WorkflowBlueprint.tsx  # Visual workflow steps
│   └── ui/                    # shadcn/ui primitives
├── hooks/
│   ├── use-speech-recognition.ts  # Mic recording + Deepgram transcription
│   └── use-mobile.tsx             # Responsive breakpoint hook
├── lib/
│   ├── history.ts             # LocalStorage history helpers
│   └── utils.ts               # Tailwind merge utility
├── pages/
│   └── Index.tsx              # Main application page
├── types/
│   └── analysis.ts            # TypeScript interfaces
└── integrations/
    └── supabase/              # Auto-generated Lovable Cloud client

supabase/functions/
├── analyze-task/              # Calls Codewords API for task analysis
├── summarize-task/            # Generates short labels via Lovable AI
└── transcribe-audio/          # Sends audio to Deepgram for transcription
```

## Getting Started

### Using Lovable

Visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

### Local Development

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

Requires Node.js (install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

## Environment & Secrets

The app requires the following secrets configured in Lovable Cloud:

| Secret | Purpose |
|---|---|
| `CODEWORDS_API_KEY` | Authenticates requests to the Codewords task analysis API |
| `DEEPGRAM_API_KEY` | Authenticates requests to the Deepgram speech-to-text API |
| `LOVABLE_API_KEY` | Authenticates requests to the Lovable AI Gateway |

> **Note:** There is no `.env` file to manage. Secrets are stored securely in Lovable Cloud and accessed by edge functions at runtime.

## Deployment

Open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click **Share → Publish**.

## Custom Domain

Navigate to **Project → Settings → Domains → Connect Domain**. [Learn more](https://docs.lovable.dev/features/custom-domain#custom-domain).

## License

Private project built with [Lovable](https://lovable.dev).
