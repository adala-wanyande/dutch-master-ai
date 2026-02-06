# 🇳🇱 DutchMaster AI: The Polyglot Homework Helper

**DutchMaster AI** is a multi-modal web application designed to bridge the gap between "textbook Dutch" and "native fluency."

Unlike standard translation tools that offer literal interpretations, this agent acts as a **human-in-the-loop linguistic tutor**. It uses a swarm of three state-of-the-art AI models (GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro) to analyze images of homework, compare answers, and—most importantly—explain the **idiomatic context** and **grammatical rules** behind every solution.

---

## 🚀 Key Features & Implementation Strategy

This application is architected to handle the specific "Oefening" (Exercise) structure of advanced Dutch learning.

### 1. The "Consensus Engine" (Multi-Model Comparison)
**Goal:** Prevent hallucinations and "Dunglish" translations.
*   **The Problem:** One model might give a grammatically correct but socially awkward answer.
*   **The Solution:** We query three models in parallel.
    *   **GPT-4o:** The Logic Anchor (Great for strict grammar rules).
    *   **Claude 3.5 Sonnet:** The Poet (Excellent for nuance, tone, and idioms).
    *   **Gemini 1.5 Pro:** The Context King (Large context window for long texts).
*   **Implementation:**
    *   **Backend:** FastAPI using `asyncio.gather()` to hit all 3 API endpoints simultaneously to minimize latency.
    *   **Frontend:** A 3-column "Battle View" allowing the user to compare responses side-by-side.

### 2. The Idiom Deep-Dive (Context Engine)
*Applies to: Tekst, Oefening 2, 4, 7*
*   **Feature:** Instead of translating "De kat uit de boom kijken" as "Looking the cat out of the tree," the agent identifies it as an idiom.
*   **Output:** Returns a structured card containing:
    1.  **Literal:** "Look cat out of tree."
    2.  **Meaning:** "To wait and see which way the wind blows."
    3.  **Origin:** Historical context of the phrase.
    4.  **Register:** Is this formal, street slang, or old-fashioned?
*   **Implementation:** System prompts instruct the AI to return **JSON** data, which the frontend renders into interactive "Idiom Cards" rather than plain text.

### 3. The Grammar Mechanic
*Applies to: Oefening 3 (Woordvolgorde), 5 (Voorzetsels), 6 (Spelling)*
*   **Feature:** It doesn't just solve the problem; it cites the rule.
*   **Example Output:** "Answer: *heeft*. **Reason:** This is the Present Perfect (V.T.T). Because the auxiliary verb is used with a static verb of position, we use *hebben*, not *zijn*."
*   **Implementation:** The system prompt forces a "Answer + Citation" format. If models disagree on a preposition (e.g., *op* vs *aan*), the UI highlights the conflict for user review.

### 4. The "Native" Writing Coach
*Applies to: Oefening 8 (Opstel)*
*   **Feature:** Users upload a photo of their handwritten essay or type a draft.
*   **Action:** The AI performs "Idiom Injection." It corrects errors but also suggests 3 specific changes to make the text sound less like a translation and more like a native speaker wrote it.
*   **Implementation:** A tiered prompt strategy: (1) Transcribe -> (2) Correct Grammar -> (3) Elevate Style.

---

## 🛠 Tech Stack

### Frontend
*   **Framework:** **Next.js 14+** (App Router)
*   **Styling:** **Tailwind CSS** (Grid layouts for comparison views)
*   **Icons:** Lucide React
*   **State Management:** React Hooks (for handling image upload/preview)

### Backend
*   **Framework:** **FastAPI** (Python)
*   **Concurrency:** `asyncio` for parallel model execution
*   **Validation:** Pydantic (ensuring AI returns valid data structures)
*   **Image Processing:** Pillow (PIL) for optimization before API transmission

### AI Models (The Swarm)
*   **OpenAI:** GPT-4o
*   **Anthropic:** Claude 3.5 Sonnet
*   **Google:** Gemini 1.5 Pro

---

## 📂 Project Structure

```bash
/dutch-master-ai
├── /frontend          # Next.js Application
│   ├── /app           # App Router pages
│   ├── /components    # UI Components (AnalysisGrid, UploadZone)
│   └── /utils         # API client helpers
├── /backend           # FastAPI Application
│   ├── /routers       # Endpoint logic
│   ├── /services      # Wrappers for OpenAI, Anthropic, Gemini
│   ├── main.py        # Entry point
│   └── requirements.txt
└── README.md
```

---

## ⚡️ Quick Start Guide

### Prerequisites
1.  **Node.js** (v18+)
2.  **Python** (v3.10+)
3.  **API Keys** for OpenAI, Anthropic, and Google AI Studio.

### 1. Backend Setup (FastAPI)

Navigate to the backend folder:
```bash
cd backend
```

Create a virtual environment and activate it:
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:
```env
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_API_KEY="AIza..."
```

Run the server:
```bash
uvicorn main:app --reload
```
*The backend is now running at `http://127.0.0.1:8000`*

### 2. Frontend Setup (Next.js)

Navigate to the frontend folder:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```
*The app is now running at `http://localhost:3000`*

---

## 📖 Usage Guide

1.  **Select Task:** Choose your specific homework exercise (e.g., "Grammar & Word Order" or "Essay Review").
2.  **Capture:** Click the camera icon to snap a photo of your textbook page or handwritten notes.
3.  **Analyze:** Hit "Process". The system will send the image to all 3 AIs.
4.  **Compare:** Watch the columns populate.
    *   *Green Check:* All models agree.
    *   *Yellow Alert:* Models disagree (indicates a nuanced linguistic point).
5.  **Learn:** Click on highlighted phrases to see the "Idiom Card" popup.

---

## 🗺 Roadmap

*   [ ] **Phase 1:** Core Logic. Build FastAPI backend with basic Multi-Model async support.
*   [ ] **Phase 2:** Frontend UI. Build the upload & comparison grid in Next.js.
*   [ ] **Phase 3:** Prompt Engineering. Refine system prompts for each specific "Oefening" type.
*   [ ] **Phase 4:** Structured Output. Force JSON responses for the "Idiom" tasks to create a better UI experience.
*   [ ] **Phase 5:** Deployment. Push to Vercel (FE) and Railway/Render (BE).