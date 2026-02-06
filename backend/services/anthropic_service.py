import base64
import json
import os
from dotenv import load_dotenv
from models_config import ModelTier, get_anthropic_model

load_dotenv()

_client = None


def get_client():
    """Lazily create the Anthropic client."""
    global _client
    if _client is None:
        from anthropic import AsyncAnthropic
        _client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    return _client


def detect_media_type(image_bytes: bytes) -> str:
    """Detect image media type from bytes."""
    if image_bytes[:8] == b'\x89PNG\r\n\x1a\n':
        return "image/png"
    elif image_bytes[:4] == b'GIF8':
        return "image/gif"
    elif image_bytes[:4] == b'RIFF' and image_bytes[8:12] == b'WEBP':
        return "image/webp"
    return "image/jpeg"


async def ask_claude(system_prompt: str, image_bytes: bytes, model_tier: ModelTier = ModelTier.PRO) -> dict:
    """Query Claude with an image and system prompt."""
    model_config = get_anthropic_model(model_tier)
    model_id = model_config["model_id"]
    display_name = model_config["display_name"]
    max_tokens = model_config["max_tokens"]

    base64_image = base64.b64encode(image_bytes).decode("utf-8")
    media_type = detect_media_type(image_bytes)

    try:
        client = get_client()

        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": base64_image
                        }
                    },
                    {
                        "type": "text",
                        "text": "Please analyze this Dutch homework image according to your instructions."
                    }
                ]
            }
        ]

        # Use extended thinking for the thinking tier
        if model_tier == ModelTier.THINKING:
            response = await client.messages.create(
                model=model_id,
                max_tokens=max_tokens,
                thinking={
                    "type": "enabled",
                    "budget_tokens": 10000
                },
                messages=messages,
                system=system_prompt,
            )
            # Extract text from thinking response (may have thinking blocks)
            content_parts = []
            for block in response.content:
                if block.type == "text":
                    content_parts.append(block.text)
            content = "\n".join(content_parts)
        else:
            response = await client.messages.create(
                model=model_id,
                max_tokens=max_tokens,
                system=system_prompt,
                messages=messages
            )
            content = response.content[0].text

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
