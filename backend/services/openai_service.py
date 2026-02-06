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


async def ask_gpt(system_prompt: str, image_bytes: bytes, model_tier: ModelTier = ModelTier.PRO) -> dict:
    """Query OpenAI with an image and system prompt."""
    model_config = get_openai_model(model_tier)
    model_id = model_config["model_id"]
    display_name = model_config["display_name"]
    max_tokens = model_config["max_tokens"]

    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    try:
        client = get_client()

        # o-series models (o1, o3) use a different API format
        if model_id.startswith("o1") or model_id.startswith("o3"):
            # o1 models don't support system messages the same way
            # Combine system prompt with user message
            response = await client.chat.completions.create(
                model=model_id,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": f"Instructions: {system_prompt}\n\nPlease analyze this Dutch homework image according to the instructions above."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            },
                        ]
                    }
                ],
                max_completion_tokens=max_tokens
            )
        else:
            # Standard GPT-4o / GPT-4o-mini format
            response = await client.chat.completions.create(
                model=model_id,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            },
                            {
                                "type": "text",
                                "text": "Please analyze this Dutch homework image according to your instructions."
                            }
                        ]
                    }
                ],
                max_completion_tokens=max_tokens
            )

        content = response.choices[0].message.content
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
