"""
gen_ai/__init__.py
SkyGuard AI — Generative AI & Meteorological Intelligence Module.
"""

from gen_ai.misty_copilot import MistyCopilot, misty_copilot
from gen_ai.prompts import SYSTEM_KNOWLEDGE_PROMPT

__all__ = ["MistyCopilot", "misty_copilot", "SYSTEM_KNOWLEDGE_PROMPT"]
