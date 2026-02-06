# DutchMaster AI

A multi-model web application for Dutch homework analysis. Uses three AI providers (OpenAI, Anthropic, Google) in parallel to analyze homework images, explain grammar rules, and decode Dutch idioms.

## Features

- **Multi-Model Analysis**: Queries GPT-5/o3, Claude Sonnet 4, and Gemini 3 Pro simultaneously
- **10 Homework Types**: Specialized prompts for each exercise type (Tekst + 9 Oefeningen)
- **3 Model Tiers**: Thinking (deep reasoning), Pro (balanced), Fast (quick responses)
- **Idiom Detection**: Identifies Dutch expressions with literal translations, meanings, and origins
- **Grammar Explanations**: Cites specific rules for word order, prepositions, and spelling
- **PDF Export**: Download all responses as a formatted PDF for academic records
- **Markdown Rendering**: Properly formatted responses with headers, lists, and emphasis

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- Tailwind CSS 4 with Typography plugin
- React Markdown for response rendering
- jsPDF for PDF generation
- Lucide React icons

### Backend
- FastAPI with async support
- Parallel model execution via asyncio.gather()
- Pydantic for response validation

### AI Models

| Tier | OpenAI | Anthropic | Google |
|------|--------|-----------|--------|
| Thinking | o3 | Claude Sonnet 4 (extended thinking) | Gemini 2.5 Pro |
| Pro | GPT-5 | Claude Sonnet 4 | Gemini 3 Pro |
| Fast | GPT-4o Mini | Claude 3.5 Haiku | Gemini 3 Flash |

## Project Structure

```
/dutch-master-ai
├── /frontend
│   ├── /src
│   │   ├── /app              # Next.js pages
│   │   ├── /components       # UI components
│   │   │   ├── UploadZone.tsx
│   │   │   ├── TaskSelector.tsx
│   │   │   ├── ModelTierSelector.tsx
│   │   │   ├── ModelCard.tsx
│   │   │   ├── IdiomCard.tsx
│   │   │   └── AnalysisGrid.tsx
│   │   └── /utils
│   │       ├── api.ts        # API client
│   │       └── pdf.ts        # PDF generation
│   ├── .env.example
│   └── package.json
├── /backend
│   ├── /services
│   │   ├── __init__.py
│   │   ├── openai_service.py
│   │   ├── anthropic_service.py
│   │   └── gemini_service.py
│   ├── main.py               # FastAPI app
│   ├── models_config.py      # Model tier configuration
│   ├── requirements.txt
│   ├── render.yaml           # Render deployment config
│   └── .env.example
└── README.md
```

## Homework Types

1. **Tekst** - Main chapter text analysis with vocabulary and cultural context
2. **Oefening 1 - Vragen** - Open-ended comprehension questions
3. **Oefening 2 - Formulering** - Correct formulation (idioms/expressions)
4. **Oefening 3 - Woordvolgorde** - Word order exercises
5. **Oefening 4 - Uitdrukkingen** - Fill-in-the-blank expressions
6. **Oefening 5 - Voorzetsels** - Preposition selection
7. **Oefening 6 - Spelling** - Verb conjugation (OTT/OVT)
8. **Oefening 7 - Woordenschat** - Vocabulary in context
9. **Oefening 8 - Opstel** - Essay writing (200-250 words)
10. **Oefening 9 - Luisteren/Spreken** - Listening and speaking preparation

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.10+
- API keys for OpenAI, Anthropic, and Google AI

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
uvicorn main:app --reload
```

Backend runs at http://127.0.0.1:8000

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local if needed (defaults to localhost:8000)
npm run dev
```

Frontend runs at http://localhost:3000

## Deployment

### Backend on Render (Free Tier)

1. Push code to GitHub
2. Go to [render.com](https://render.com) > New > Web Service
3. Connect your GitHub repo
4. Configure:
   - Root Directory: `backend`
   - Runtime: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `GOOGLE_API_KEY`
   - `ALLOWED_ORIGINS` (your Vercel URL, added after frontend deploy)
6. Deploy and copy the service URL

### Frontend on Vercel (Free Tier)

1. Go to [vercel.com](https://vercel.com) > Import project
2. Connect your GitHub repo
3. Configure:
   - Root Directory: `frontend`
   - Framework: Next.js (auto-detected)
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your Render URL
5. Deploy and copy the URL

### Final Step

Update Render's `ALLOWED_ORIGINS` environment variable with your Vercel URL.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Health status |
| GET | `/models` | List available model tiers |
| POST | `/analyze_homework` | Analyze uploaded image |

### POST /analyze_homework

Form data:
- `file`: Image file (JPEG, PNG)
- `task_type`: One of the 10 homework types
- `model_tier`: `thinking`, `pro`, or `fast`

Returns array of model responses with `model_name`, `content`, and optional `idiom_analysis`.

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
```

## License

MIT
