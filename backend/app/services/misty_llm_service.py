"""
backend/app/services/misty_llm_service.py
SkyGuard AI — Misty AI Meteorological Assistant & Conversational Knowledge Engine.
Clean, conversational, and direct responses without AI slop or unnecessary jargon.
"""

from __future__ import annotations

import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

# Canonical System Grounding Prompt
SYSTEM_KNOWLEDGE_PROMPT = """
You are Misty, the smart, friendly, and helpful Meteorological AI Assistant for SkyGuard AI.
SkyGuard AI monitors automatic weather stations in real-time to detect sensor faults, track hardware health, and ensure reliable weather observations.

### Core Capabilities:
- Weather Stations: Real-time surveillance of automatic weather stations monitoring temperature, humidity, and barometric pressure.
- Quality Control: 5-Tier quality checking that verifies physical limits, rates of change, temporal patterns, thermodynamic consistency, and spatial consensus with neighboring stations.
- Sensor Health: Continuous health index (0 to 100%) tracking sensor degradation and recommending maintenance.
- Fault Simulation: Realistic simulation of sensor drift, stuck values, noise spikes, and storm events.
- Root Cause Analysis: Explainable attribution showing which sensor caused an alert and why.

### Guidelines:
- Speak naturally, clearly, and concisely in the user's preferred language (English, Hinglish, or Hindi).
- Avoid robotic jargon, buzzwords, or unnecessary technical acronyms unless specifically asked.
- Provide practical, helpful explanations with clear takeaways.
"""

class MistyLlmService:
    def __init__(self):
        self.default_api_key = os.getenv("GEMINI_API_KEY", "")
        self.gemini_endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

    async def generate_response(
        self,
        query: str,
        language: str = "EN",
        current_page: Optional[str] = None,
        api_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generates a helpful, clean response using Gemini with local fallback."""
        active_key = api_key or self.default_api_key or os.getenv("GEMINI_API_KEY", "")

        context_header = f"[Context: Page: {current_page or 'Dashboard'} | Language: {language}]"
        full_user_prompt = f"{context_header}\nQuestion: {query}\n\nPlease provide a clear, friendly, and concise answer as Misty in {language}."

        if active_key:
            try:
                result = await self._call_gemini_api(active_key, full_user_prompt)
                if result:
                    return {
                        "text": result,
                        "source": "GEMINI_AI",
                        "term": query,
                        "suggested_questions": self._generate_suggested_questions(query, language),
                    }
            except Exception as e:
                logger.warning("Gemini API call failed, falling back to local reasoning: %s", e)

        return self._local_knowledge_synthesis(query, language, current_page)

    async def _call_gemini_api(self, api_key: str, prompt: str) -> Optional[str]:
        """Calls Google Gemini 1.5 Flash endpoint."""
        url = f"{self.gemini_endpoint}?key={api_key}"
        payload = {
            "system_instruction": {
                "parts": [{"text": SYSTEM_KNOWLEDGE_PROMPT}]
            },
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 1024,
            }
        }

        def _do_request():
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "")
            return None

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _do_request)

    def _local_knowledge_synthesis(self, query: str, language: str, current_page: Optional[str]) -> Dict[str, Any]:
        """Provides concise, natural, and friendly meteorological explanations."""
        norm_q = query.lower()

        if language == "HI":
            if "स्वास्थ्य" in norm_q or "health" in norm_q:
                text = (
                    "**सेंसर स्वास्थ्य सूचकांक (Sensor Health Index):**\n\n"
                    "सेंसर स्वास्थ्य का स्कोर 0 से 100% के बीच होता है:\n\n"
                    "• **90 - 100% (उत्कृष्ट):** सेंसर पूरी तरह से स्थिर और सटीक है।\n"
                    "• **75 - 89% (अच्छा):** सामान्य कार्यप्रणाली, मामूली शोर या बहाव।\n"
                    "• **50 - 74% (खराब):** सेंसर में ड्रिफ्ट या अनिश्चितता, निरीक्षण की आवश्यकता।\n"
                    "• **50% से कम (गंभीर):** सेंसर में खराबी, तत्काल बदलने की सलाह दी जाती है।"
                )
            elif "गुणवत्ता" in norm_q or "qc" in norm_q or "pipeline" in norm_q:
                text = (
                    "**गुणवत्ता नियंत्रण पाइपलाइन (Quality Control Pipeline):**\n\n"
                    "हमारी प्रणाली 5 चरणों में डेटा की जांच करती है:\n\n"
                    "1. **भौतिक सीमाएं:** तापमान, दबाव और आर्द्रता की स्वाभाविक सीमाओं की पुष्टि।\n"
                    "2. **रेट-ऑफ-चेंज:** असंभव तेज उछाल या फ्लैटलाइन (stuck values) की पहचान।\n"
                    "3. **भौतिक स्थिरता:** ओस बिंदु (Dew Point) और मौसम समीकरणों की जांच।\n"
                    "4. **पड़ोसी स्टेशनों से तुलना:** आस-पास के स्टेशनों से मिलान ताकि असली तूफान और सेंसर खराबी में अंतर समझ आए।\n"
                    "5. **कारण विश्लेषण:** स्पष्ट व्याख्या कि कौन सा सेंसर और क्यों फ्लैग हुआ।"
                )
            else:
                text = (
                    f"**मिस्टी उत्तर:**\n\n"
                    f"आपके प्रश्न **\"{query}\"** के संदर्भ में:\n\n"
                    f"स्काईगार्ड एआई लगातार मौसम स्टेशनों की निगरानी करता है ताकि डेटा की गुणवत्ता बनी रहे और सेंसर की किसी भी गड़बड़ी का तुरंत पता चल सके।\n\n"
                    f"आप स्क्रीन पर किसी भी स्टेशन या अलर्ट पर क्लिक करके विस्तृत जानकारी देख सकते हैं।"
                )
            suggested = [
                "सेंसर स्वास्थ्य कैसे मापा जाता है?",
                "मौसम अलर्ट कैसे काम करते हैं?",
                "दबाव में गिरावट का क्या अर्थ है?",
            ]
        elif language == "HINGLISH":
            if "health" in norm_q:
                text = (
                    "**Sensor Health Index (0 - 100%):**\n\n"
                    "• **90 - 100% (Excellent):** Sensor perfectly healthy aur accurate hai.\n"
                    "• **75 - 89% (Good):** Normal operations with minor noise.\n"
                    "• **50 - 74% (Degraded):** Sensor mein drift ya variance badh raha hai, maintenance check zaroori hai.\n"
                    "• **< 50% (Critical):** Immediate sensor replacement ya repair recommended hai."
                )
            elif "qc" in norm_q or "pipeline" in norm_q or "work" in norm_q:
                text = (
                    "**5-Tier Quality Control:**\n\n"
                    "1. **Physical Limits:** Gross temperature, pressure, aur humidity boundaries check hoti hain.\n"
                    "2. **Rate of Change:** Unrealistic sudden jumps aur frozen readings detect hoti hain.\n"
                    "3. **Thermodynamics:** Dew point aur atmospheric consistency check ki jaati hai.\n"
                    "4. **Spatial Buddy-Check:** Neighboring stations ke saath compare karke real storms aur false alarms ko alag kiya jaata hai.\n"
                    "5. **Root-Cause Attribution:** Exactly batata hai ki kaunsa sensor fail hua aur kyun."
                )
            else:
                text = (
                    f"**Misty Assistant:**\n\n"
                    f"Aapke sawaal **\"{query}\"** ke liye:\n\n"
                    f"SkyGuard AI aapke sabhi weather stations ko real-time monitor karta hai taaki accurate observations aur sensor health track ho sakein.\n\n"
                    f"Aap live charts, alerts, aur diagnostics directly screen par explore kar sakte hain."
                )
            suggested = [
                "How is sensor health calculated?",
                "Explain 5-tier quality control",
                "What causes storm pressure drops?",
            ]
        else:
            if "health" in norm_q or "shi" in norm_q:
                text = (
                    "### Sensor Health Index (SHI)\n\n"
                    "The **Sensor Health Index (0 to 100%)** evaluates continuous hardware performance:\n\n"
                    "- **90 - 100% (Excellent)**: Clean signal with negligible noise or drift.\n"
                    "- **75 - 89% (Good)**: Normal operation with occasional minor fluctuations.\n"
                    "- **50 - 74% (Degraded)**: Elevated drift or variance; inspection suggested.\n"
                    "- **< 50% (Critical)**: Persistent fault detected; sensor replacement recommended."
                )
            elif "qc" in norm_q or "pipeline" in norm_q or "how" in norm_q or "work" in norm_q:
                text = (
                    "### 5-Tier Quality Control Pipeline\n\n"
                    "The system validates each incoming weather observation across 5 progressive checks:\n\n"
                    "1. **Physical Bounds**: Validates plausible climatological ranges for temperature, pressure, and humidity.\n"
                    "2. **Rate of Change & Temporal Trends**: Catches sudden electrical spikes, sensor flatlines, and drops.\n"
                    "3. **Atmospheric Physics**: Checks thermodynamic laws, including dew point depression ($T_{dew} \\le T_{air}$).\n"
                    "4. **Spatial Consensus**: Compares observations against neighboring stations to distinguish regional storms from isolated hardware failures.\n"
                    "5. **Root-Cause Diagnostics**: Isolates the responsible sensor and computes diagnostic explanations."
                )
            elif "dew point" in norm_q:
                text = (
                    "### Dew Point Depression\n\n"
                    "**Dew point** is the temperature at which air becomes saturated with water vapor and condensation begins.\n\n"
                    "- **Dew Point Depression ($T - T_{dew}$)**: The difference between dry air temperature and dew point.\n"
                    "- When the depression is close to **0°C**, humidity is near **100%** (fog or rain).\n"
                    "- If a sensor reports a dew point *higher* than the air temperature ($T_{dew} > T$), it signals sensor drift or a calibration fault."
                )
            else:
                text = (
                    f"### Weather & Sensor Assistant\n\n"
                    f"Regarding **\"{query}\"**:\n\n"
                    f"SkyGuard AI monitors continuous observation streams to ensure data accuracy and track sensor reliability.\n\n"
                    f"You can explore live telemetry, view active alerts, review sensor health, or test fault scenarios from the navigation menu."
                )
            suggested = [
                "How does quality control work?",
                "How is sensor health calculated?",
                "What causes pressure drops in storms?",
            ]

        return {
            "text": text,
            "source": "MISTY_AI",
            "term": query,
            "suggested_questions": suggested,
        }

    def _generate_suggested_questions(self, query: str, language: str) -> List[str]:
        if language == "HI":
            return [
                "सेंसर स्वास्थ्य कैसे मापा जाता है?",
                "मौसम अलर्ट कैसे काम करते हैं?",
                "दबाव में गिरावट का क्या अर्थ है?",
            ]
        elif language == "HINGLISH":
            return [
                "How is sensor health calculated?",
                "Explain 5-tier quality control",
                "What causes storm pressure drops?",
            ]
        return [
            "How does quality control work?",
            "How is sensor health calculated?",
            "What causes pressure drops in storms?",
        ]


misty_llm_service = MistyLlmService()
