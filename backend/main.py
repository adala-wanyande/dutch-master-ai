# main.py
import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from typing import List

from services import ask_gpt, ask_claude, ask_gemini
from models_config import ModelTier, TIER_INFO, OPENAI_MODELS, ANTHROPIC_MODELS, GEMINI_MODELS

app = FastAPI(
    title="DutchMaster AI",
    description="Multi-model Dutch homework analysis API",
    version="1.0.0"
)

# CORS middleware - allow configured origins or defaults for local dev
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "DutchMaster AI API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/models")
async def get_models():
    """Return available model tiers and their configurations."""
    return {
        "tiers": {
            tier.value: {
                "name": TIER_INFO[tier]["name"],
                "description": TIER_INFO[tier]["description"],
                "models": {
                    "openai": OPENAI_MODELS[tier]["display_name"],
                    "anthropic": ANTHROPIC_MODELS[tier]["display_name"],
                    "gemini": GEMINI_MODELS[tier]["display_name"],
                }
            }
            for tier in ModelTier
        }
    }


class ModelResponse(BaseModel):
    model_name: str
    content: str
    idiom_analysis: dict | None  # Optional structured data for idioms


@app.post("/analyze_homework", response_model=List[ModelResponse])
async def analyze_homework(
    task_type: str = Form(...),
    model_tier: str = Form("pro"),  # thinking, fast, or pro
    file: UploadFile = File(...)
):
    # 1. Read file bytes
    image_bytes = await file.read()

    # 2. Parse model tier
    try:
        tier = ModelTier(model_tier)
    except ValueError:
        tier = ModelTier.PRO

    # 3. Select the specific System Prompt based on user's selected homework type
    system_prompt = get_prompt_for_task(task_type)

    # 4. Run all models in parallel using asyncio.gather
    # This makes the wait time equal to the slowest model, not the sum of all three.
    results = await asyncio.gather(
        ask_gpt(system_prompt, image_bytes, tier),
        ask_claude(system_prompt, image_bytes, tier),
        ask_gemini(system_prompt, image_bytes, tier)
    )

    return results

def get_prompt_for_task(task_type: str) -> str:
    prompts = {
        # Tekst - Main chapter text analysis
        "tekst": """
You are an expert Dutch language tutor specializing in advanced Dutch (B2-C1 level).
Analyze this Dutch text thoroughly:

1. **Summary**: Provide a brief summary of the text in Dutch, then in English.
2. **Key Vocabulary**: List important/difficult words with:
   - Dutch word
   - English translation
   - Example usage from the text
3. **Idioms & Expressions**: Identify any idioms or fixed expressions:
   - Literal translation
   - Actual meaning
   - Register (formal/informal/dated)
4. **Grammar Points**: Note any advanced grammar structures used.
5. **Cultural Context**: Explain any Dutch cultural references.

Format your response clearly with headers for each section.
        """,

        # Oefening 1 - Open-ended questions based on text
        "oefening_1_vragen": """
You are a Dutch language teacher helping a student answer comprehension questions.
These are open-ended questions (Vragen) based on a Dutch text.

For each question in the image:
1. **Identify the question** (transcribe it)
2. **Provide a model answer** in Dutch
3. **Explain the answer** - why this is correct, referencing the text
4. **Key vocabulary** used in the answer
5. **Alternative phrasings** - other acceptable ways to answer

Be thorough but natural-sounding. Answers should demonstrate understanding, not just copy from the text.
        """,

        # Oefening 2 - Which formulation is correct (idioms/vocabulary)
        "oefening_2_formulering": """
You are a Dutch idiom and expression specialist.
This exercise asks: "Welke formulering is correct?" - choosing correct formulations.

For each item:
1. **Transcribe the options** shown
2. **Identify the CORRECT answer** with confidence
3. **Explain WHY it's correct**:
   - Is it an idiom? Explain its meaning and origin
   - Is it a fixed collocation? Explain why these words go together
   - Is it about register? Explain the formality level
4. **Why the other options are WRONG** - common mistakes to avoid
5. **Memory tip** - a way to remember the correct form

Pay special attention to:
- Fixed expressions (vaste uitdrukkingen)
- Collocations that don't translate literally from English
- Subtle differences in meaning between similar phrases
        """,

        # Oefening 3 - Word order (Woordvolgorde)
        "oefening_3_woordvolgorde": """
You are a Dutch grammar expert specializing in word order (woordvolgorde).
This exercise focuses on correct Dutch sentence structure.

For each sentence or transformation:
1. **Transcribe the exercise** (including any example/voorbeeld given)
2. **Provide the correct answer** with proper word order
3. **CITE THE RULE** - Name the specific grammar rule:
   - V2 rule (verb second position)
   - Subordinate clause word order (SOV)
   - Inversion after fronted elements
   - Position of niet/geen
   - Time-Manner-Place order
   - Separable verb positioning
4. **Show the sentence structure** using brackets or a diagram
5. **Common mistakes** - what errors students typically make here

Dutch word order rules to consider:
- Main clause: Subject-Verb-Object (but verb MUST be position 2)
- Subordinate clause: Subject-Object-Verb (verb at end)
- Inversion when time/place/other element is fronted
- Perfect tense: auxiliary in V2, past participle at end
        """,

        # Oefening 4 - Expressions (fill in the blank)
        "oefening_4_uitdrukkingen": """
You are an expert in Dutch expressions and idioms (uitdrukkingen).
This is a fill-in-the-blank exercise for Dutch expressions.

For each blank:
1. **Transcribe the sentence** with the blank
2. **Provide the correct answer**
3. **Complete expression**: Show the full idiom/expression
4. **Literal translation**: Word-for-word in English
5. **Actual meaning**: What it really means
6. **Origin/etymology**: Historical background if known
7. **Usage example**: Another sentence using this expression
8. **Register**: Formal/informal/dated/regional

Common Dutch expression patterns to watch for:
- Animal idioms (de kat uit de boom kijken)
- Body part idioms (met de handen in het haar zitten)
- Weather expressions
- Food-related sayings
        """,

        # Oefening 5 - Prepositions (Voorzetsels)
        "oefening_5_voorzetsels": """
You are a Dutch preposition specialist. Dutch prepositions (voorzetsels) often don't match English!
This exercise asks you to choose the correct preposition, often within a longer text.

For each preposition choice:
1. **Context**: Show the sentence with the blank
2. **Correct preposition**: The right answer
3. **WHY this preposition**:
   - Is it a fixed combination with a verb? (wachten OP, denken AAN)
   - Is it a fixed combination with a noun? (interesse IN)
   - Is it a fixed combination with an adjective? (trots OP)
   - Is it about direction vs. location? (in/naar, op/aan)
4. **English comparison**: Why the English preposition doesn't work here
5. **Similar combinations**: Other verbs/nouns that use this preposition
6. **Memory trick**: How to remember this combination

Key Dutch preposition rules:
- aan, op, in, naar, van, voor, met, bij, over, om, uit, door, tegen, tussen, zonder
- Many are FIXED with specific verbs - must be memorized
- Direction vs location distinction
        """,

        # Oefening 6 - Spelling (verb conjugation OVT/OTT)
        "oefening_6_spelling": """
You are a Dutch spelling and verb conjugation expert.
This exercise focuses on correct spelling, especially verb forms (OTT = present, OVT = past).

For each item:
1. **Transcribe the exercise**
2. **Provide the correct spelling/form**
3. **Explain the rule**:

   For VERBS, identify:
   - Infinitive form
   - Is it regular (zwak) or irregular (sterk)?
   - OTT (Onvoltooid Tegenwoordige Tijd) rules
   - OVT (Onvoltooid Verleden Tijd) rules
   - 't kofschip rule for weak verbs
   - Stem changes for strong verbs

   For SPELLING, consider:
   - Open vs closed syllables (maten vs matten)
   - D/T rules at word endings
   - Double vowels and consonants
   - IJ vs EI
   - AU vs OU

4. **Conjugation table**: Show relevant forms if it's a verb
5. **Similar verbs**: Other verbs that follow the same pattern
6. **Common errors**: Mistakes to avoid
        """,

        # Oefening 7 - Vocabulary (word choice in context)
        "oefening_7_woordenschat": """
You are a Dutch vocabulary expert (woordenschat specialist).
This exercise presents texts where you must choose the correct word from options.

For each vocabulary choice:
1. **Context**: The sentence with the blank
2. **Correct word**: The right choice
3. **Meaning**: Definition in Dutch and English
4. **Why it fits**: How it works in this specific context
5. **Why others don't fit**: Explain each wrong option
   - Different meaning?
   - Wrong register?
   - Wrong collocation?
   - Wrong connotation?
6. **Word family**: Related words (noun, verb, adjective forms)
7. **Synonyms & antonyms**: Similar and opposite words
8. **Example sentences**: 2-3 more uses of this word

Pay attention to:
- False friends (words that look like English but mean different things)
- Subtle differences between synonyms
- Formal vs informal register
- Regional variations (Belgian Dutch vs Netherlands Dutch)
        """,

        # Oefening 8 - Essay writing
        "oefening_8_opstel": """
You are a Dutch writing coach helping with essay composition (opstel).
The student needs to write a 200-250 word essay on the given topic.

Your task:
1. **Identify the topic/prompt** from the image
2. **Provide a model essay** (200-250 words) that:
   - Has a clear structure (inleiding, middenstuk, conclusie)
   - Uses appropriate linking words (connectors)
   - Demonstrates B2-C1 level vocabulary
   - Includes at least 2-3 idioms or expressions naturally
   - Shows variety in sentence structure
3. **Structural breakdown**:
   - Introduction techniques used
   - Paragraph organization
   - Conclusion strategies
4. **Key vocabulary list**: Important words for this topic
5. **Useful expressions**: Phrases that elevate the writing
6. **Grammar highlights**: Advanced structures demonstrated
7. **Alternative approaches**: Other valid ways to structure the essay

Writing tips for Dutch essays:
- Dutch essays tend to be direct and well-structured
- Use connectors: echter, daarom, bovendien, ten slotte
- Avoid anglicisms where Dutch alternatives exist
        """,

        # Oefening 9 - Listening and speaking preparation
        "oefening_9_luisteren_spreken": """
You are a Dutch speaking coach preparing a student for oral presentation.
This exercise involves listening/reading material and preparing a brief speech.

Based on the image:
1. **Identify the topic/assignment**
2. **Key points to address**: Main ideas that should be covered
3. **Model speech outline**:
   - Opening (how to begin naturally)
   - Main points (3-4 key ideas with supporting details)
   - Conclusion (how to wrap up effectively)
4. **Speaking vocabulary**: Key words and phrases for this topic
5. **Pronunciation notes**: Any tricky words to practice
6. **Filler phrases**: Natural Dutch speech fillers
   - "Nou, ..." / "Dus, ..." / "Eigenlijk..."
   - "Wat ik bedoel is..." / "Met andere woorden..."
7. **Anticipated questions**: What the teacher might ask, with answers
8. **Cultural tips**: Dutch presentation style and expectations

Dutch speaking tips:
- Be direct but polite
- Structure clearly (Dutch audiences expect organization)
- Use appropriate formal/informal register
- Practice the 'g' and 'r' sounds
        """,
    }
    return prompts.get(task_type, "Help with this Dutch homework. Analyze the image and provide a detailed, helpful response.")