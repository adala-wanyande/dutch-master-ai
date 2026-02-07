import json
import os
from dotenv import load_dotenv
from models_config import ModelTier, get_gemini_model

load_dotenv()

_client = None


def get_client():
    """Lazily create the Gemini client."""
    global _client
    if _client is None:
        from google import genai
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not set")
        _client = genai.Client(api_key=api_key)
    return _client


def detect_mime_type(image_bytes: bytes) -> str:
    """Detect image MIME type from bytes."""
    if image_bytes[:8] == b'\x89PNG\r\n\x1a\n':
        return "image/png"
    elif image_bytes[:4] == b'GIF8':
        return "image/gif"
    elif image_bytes[:4] == b'RIFF' and image_bytes[8:12] == b'WEBP':
        return "image/webp"
    return "image/jpeg"


async def ask_gemini(system_prompt: str, images_bytes: list[bytes], model_tier: ModelTier = ModelTier.PRO) -> dict:
    """Query Gemini with images and system prompt."""
    model_config = get_gemini_model(model_tier)
    model_id = model_config["model_id"]
    display_name = model_config["display_name"]
    max_tokens = model_config["max_tokens"]

    try:
        from google.genai import types

        client = get_client()

        # Build parts: all images then text
        parts = []
        for img_bytes in images_bytes:
            mime_type = detect_mime_type(img_bytes)
            parts.append(types.Part.from_bytes(data=img_bytes, mime_type=mime_type))

        count = len(images_bytes)
        parts.append(types.Part(
            text=f"Please analyze {'these' if count > 1 else 'this'} Dutch homework image{'s' if count > 1 else ''} according to your instructions."
        ))

        contents = [types.Content(role="user", parts=parts)]

        # Configure generation - enable thinking for thinking tier
        if model_tier == ModelTier.THINKING:
            config = types.GenerateContentConfig(
                system_instruction=system_prompt,
                max_output_tokens=max_tokens,
                thinking_config=types.ThinkingConfig(
                    thinking_budget=10000
                )
            )
        else:
            config = types.GenerateContentConfig(
                system_instruction=system_prompt,
                max_output_tokens=max_tokens
            )

        response = await client.aio.models.generate_content(
            model=model_id,
            contents=contents,
            config=config
        )

        content = response.text
        idiom_analysis = try_parse_json(content)

        return {
            "model_name": display_name,
            "content": content,
            "idiom_analysis": idiom_analysis
        }
    except Exception as e:
        return {
            "model_name": display_name,
            "content": f"Error: {str(e)}",
            "idiom_analysis": None
        }


def try_parse_json(text: str) -> dict | None:
    """Attempt to extract JSON from the response if present."""
    try:
        if "```json" in text:
            start = text.find("```json") + 7
            end = text.find("```", start)
            json_str = text[start:end].strip()
            return json.loads(json_str)
        return json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return None
