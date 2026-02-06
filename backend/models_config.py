"""
Model configuration for DutchMaster AI.

Three tiers of models:
- THINKING: Deep reasoning models for complex analysis (slower, more thorough)
- FAST: Quick response models for simple tasks (faster, cheaper)
- PRO: Balanced models for most use cases (good quality, reasonable speed)
"""

from enum import Enum
from typing import TypedDict


class ModelTier(str, Enum):
    THINKING = "thinking"
    FAST = "fast"
    PRO = "pro"


class ModelConfig(TypedDict):
    model_id: str
    display_name: str
    supports_vision: bool
    max_tokens: int


# OpenAI Models
OPENAI_MODELS: dict[ModelTier, ModelConfig] = {
    ModelTier.THINKING: {
        "model_id": "o3",
        "display_name": "OpenAI o3",
        "supports_vision": True,
        "max_tokens": 100000,
    },
    ModelTier.FAST: {
        "model_id": "gpt-4o-mini",
        "display_name": "GPT-4o Mini",
        "supports_vision": True,
        "max_tokens": 4096,
    },
    ModelTier.PRO: {
        "model_id": "gpt-5",
        "display_name": "GPT-5",
        "supports_vision": True,
        "max_tokens": 32000,
    },
}

# Anthropic Models
ANTHROPIC_MODELS: dict[ModelTier, ModelConfig] = {
    ModelTier.THINKING: {
        "model_id": "claude-sonnet-4-20250514",  # With extended thinking
        "display_name": "Claude Sonnet 4 (Thinking)",
        "supports_vision": True,
        "max_tokens": 16000,
    },
    ModelTier.FAST: {
        "model_id": "claude-3-5-haiku-20241022",
        "display_name": "Claude 3.5 Haiku",
        "supports_vision": True,
        "max_tokens": 2000,
    },
    ModelTier.PRO: {
        "model_id": "claude-sonnet-4-20250514",
        "display_name": "Claude Sonnet 4",
        "supports_vision": True,
        "max_tokens": 4000,
    },
}

# Google Gemini Models
GEMINI_MODELS: dict[ModelTier, ModelConfig] = {
    ModelTier.THINKING: {
        "model_id": "gemini-2.5-pro",
        "display_name": "Gemini 2.5 Pro",
        "supports_vision": True,
        "max_tokens": 16000,
    },
    ModelTier.FAST: {
        "model_id": "gemini-3-flash-preview",
        "display_name": "Gemini 3 Flash",
        "supports_vision": True,
        "max_tokens": 8000,
    },
    ModelTier.PRO: {
        "model_id": "gemini-3-pro-preview",
        "display_name": "Gemini 3 Pro",
        "supports_vision": True,
        "max_tokens": 16000,
    },
}


def get_openai_model(tier: ModelTier) -> ModelConfig:
    return OPENAI_MODELS[tier]


def get_anthropic_model(tier: ModelTier) -> ModelConfig:
    return ANTHROPIC_MODELS[tier]


def get_gemini_model(tier: ModelTier) -> ModelConfig:
    return GEMINI_MODELS[tier]


# Tier descriptions for UI
TIER_INFO = {
    ModelTier.THINKING: {
        "name": "Thinking",
        "description": "Deep reasoning for complex exercises. Best for grammar rules, idiom origins, and detailed explanations.",
        "icon": "brain",
    },
    ModelTier.FAST: {
        "name": "Fast",
        "description": "Quick responses for simple lookups. Best for spelling checks and straightforward questions.",
        "icon": "zap",
    },
    ModelTier.PRO: {
        "name": "Pro",
        "description": "Balanced quality and speed. Good for most homework tasks.",
        "icon": "sparkles",
    },
}
