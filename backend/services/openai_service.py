import base64
import json
import os
from dotenv import load_dotenv
from models_config import ModelTier, get_openai_model

load_dotenv()

_client = None


def get_client():
    """Lazily create the OpenAI client."""
    global _client
    if _client is None:
        from openai import AsyncOpenAI
        _client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _client


async def ask_gpt(system_prompt: str, images_bytes: list[bytes], model_tier: ModelTier = ModelTier.PRO) -> dict:
    """Query OpenAI with images and system prompt."""
    model_config = get_openai_model(model_tier)
    model_id = model_config["model_id"]
    display_name = model_config["display_name"]
    max_tokens = model_config["max_tokens"]

    image_parts = []
    for img_bytes in images_bytes:
        b64 = base64.b64encode(img_bytes).decode("utf-8")
        image_parts.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
        })

    count = len(images_bytes)
    text_suffix = f"Please analyze {'these' if count > 1 else 'this'} Dutch homework image{'s' if count > 1 else ''} according to {'the instructions above' if model_id.startswith(('o1', 'o3')) else 'your instructions'}."

    try:
        client = get_client()

        # o-series models (o1, o3) use a different API format
        if model_id.startswith("o1") or model_id.startswith("o3"):
            content = [
                {"type": "text", "text": f"Instructions: {system_prompt}\n\n{text_suffix}"},
                *image_parts,
            ]
            response = await client.chat.completions.create(
                model=model_id,
                messages=[{"role": "user", "content": content}],
                max_completion_tokens=max_tokens
            )
        else:
            content = [*image_parts, {"type": "text", "text": text_suffix}]
            response = await client.chat.completions.create(
                model=model_id,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": content}
                ],
                max_completion_tokens=max_tokens
            )

        content_text = response.choices[0].message.content
        idiom_analysis = try_parse_json(content_text)

        return {
            "model_name": display_name,
            "content": content_text,
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
