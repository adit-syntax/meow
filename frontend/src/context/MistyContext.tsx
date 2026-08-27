/**
 * frontend/src/context/MistyContext.tsx
 * SkyGuard AI — Misty the Cloudy Face AI Context & RAG State Provider
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MISTY_KNOWLEDGE_BASE, queryMistyRag, MistyExplanation } from '../data/mistyKnowledge';
import { askMistyApi } from '../services/api';

export type MistyLanguage = 'EN' | 'HINGLISH' | 'HI';

export interface MistyMessage {
  id: string;
  sender: 'user' | 'misty';
  text: string;
  language: MistyLanguage;
  timestamp: string;
  term?: string;
  source?: string;
  explanation?: MistyExplanation;
  suggestedQuestions?: string[];
}

interface MistyContextType {
  isAwake: boolean;
  setAwake: (awake: boolean) => void;
  toggleAwake: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  language: MistyLanguage;
  setLanguage: (lang: MistyLanguage) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  messages: MistyMessage[];
  isThinking: boolean;
  askMisty: (query: string, overrideLang?: MistyLanguage) => void;
  clarifySelection: (selectedText: string, overrideLang?: MistyLanguage) => void;
  clearChat: () => void;
  activePopoverTerm: string | null;
  setActivePopoverTerm: (term: string | null) => void;
}

const MistyContext = createContext<MistyContextType | null>(null);

const INITIAL_GREETINGS: Record<MistyLanguage, string> = {
  EN: "Hi! I'm Misty, your smart and friendly weather assistant. Ask me anything about sensor health, weather anomalies, or live stations.",
  HINGLISH: "Hi! Main Misty hoon, aapka weather assistant. Sensor health, weather anomalies, ya live station status ke baare mein kuch bhi poochein.",
  HI: "नमस्ते! मैं मिस्टी हूँ, आपका मौसम और सेंसर सहायक। स्टेशन की स्थिति, सेंसर स्वास्थ्य या मौसम संबंधी किसी भी प्रश्न के लिए पूछें।",
};

export const MistyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAwake, setIsAwakeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('skyguard_misty_awake') || localStorage.getItem('aeroshield_misty_awake');
    return saved !== null ? saved === 'true' : true;
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [language, setLanguageState] = useState<MistyLanguage>(() => {
    const saved = (localStorage.getItem('skyguard_misty_lang') || localStorage.getItem('aeroshield_misty_lang')) as MistyLanguage;
    return saved || 'EN';
  });
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>(() => {
    return localStorage.getItem('skyguard_gemini_api_key') || '';
  });
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [activePopoverTerm, setActivePopoverTerm] = useState<string | null>(null);

  const [messages, setMessages] = useState<MistyMessage[]>(() => [
    {
      id: 'greeting-1',
      sender: 'misty',
      text: INITIAL_GREETINGS[language || 'EN'],
      language: language || 'EN',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: [
        'How does quality control work?',
        'How is sensor health calculated?',
        'What causes pressure drops in storms?',
        'Tell me about station anomalies',
      ],
    },
  ]);

  const setAwake = (awake: boolean) => {
    setIsAwakeState(awake);
    localStorage.setItem('skyguard_misty_awake', String(awake));
    if (!awake) {
      setIsOpen(false);
      setActivePopoverTerm(null);
    }
  };

  const toggleAwake = () => {
    setAwake(!isAwake);
  };

  const setLanguage = (lang: MistyLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('skyguard_misty_lang', lang);
  };

  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    localStorage.setItem('skyguard_gemini_api_key', key);
  };

  const toggleOpen = () => {
    if (!isAwake) {
      setAwake(true);
      setIsOpen(true);
    } else {
      setIsOpen((prev) => !prev);
    }
  };

  const askMisty = useCallback(
    async (query: string, overrideLang?: MistyLanguage) => {
      const activeLang = overrideLang || language;
      const userMsg: MistyMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: query,
        language: activeLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsThinking(true);
      if (!isOpen) setIsOpen(true);

      try {
        const currentPage = typeof window !== 'undefined' ? window.location.pathname : undefined;
        const aiResponse = await askMistyApi({
          query,
          language: activeLang,
          current_page: currentPage,
          api_key: geminiApiKey || undefined,
        });

        const botMsg: MistyMessage = {
          id: `misty-${Date.now()}`,
          sender: 'misty',
          text: aiResponse.text,
          source: aiResponse.source,
          language: activeLang,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          term: aiResponse.term || query,
          suggestedQuestions: aiResponse.suggested_questions,
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch {
        // High-fidelity local RAG fallback if network request fails
        const ragResult = queryMistyRag(query, activeLang);
        const botMsg: MistyMessage = {
          id: `misty-${Date.now()}`,
          sender: 'misty',
          text: ragResult.response,
          source: 'RAG_ENGINE',
          language: activeLang,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          term: ragResult.term,
          explanation: ragResult.explanation,
          suggestedQuestions: ragResult.relatedQuestions,
        };

        setMessages((prev) => [...prev, botMsg]);
      } finally {
        setIsThinking(false);
      }
    },
    [language, isOpen, geminiApiKey]
  );

  const clarifySelection = useCallback(
    (selectedText: string, overrideLang?: MistyLanguage) => {
      if (!isAwake) return;
      const activeLang = overrideLang || language;
      const cleanTerm = selectedText.trim();
      const prompt =
        activeLang === 'HI'
          ? `कृपया मुझे "${cleanTerm}" का अर्थ और महत्व विस्तार से समझाएं।`
          : activeLang === 'HINGLISH'
          ? `Please explain "${cleanTerm}" in detail with real-world weather examples.`
          : `Explain the concept of "${cleanTerm}" in detail and why it matters in atmospheric QC.`;

      askMisty(prompt, activeLang);
    },
    [isAwake, language, askMisty]
  );

  const clearChat = () => {
    setMessages([
      {
        id: `greeting-${Date.now()}`,
        sender: 'misty',
        text: INITIAL_GREETINGS[language],
        language,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'What is Multivariate Inconsistency?',
          'WMO-No. 8 QC Flags explain karo',
          'सेंसर स्टिकिंग (Sensor Sticking) क्या होता है?',
          'How does Campbell CR1000X work?',
        ],
      },
    ]);
  };

  return (
    <MistyContext.Provider
      value={{
        isAwake,
        setAwake,
        toggleAwake,
        isOpen,
        setIsOpen,
        toggleOpen,
        language,
        setLanguage,
        geminiApiKey,
        setGeminiApiKey,
        messages,
        isThinking,
        askMisty,
        clarifySelection,
        clearChat,
        activePopoverTerm,
        setActivePopoverTerm,
      }}
    >
      {children}
    </MistyContext.Provider>
  );
};

export const useMisty = () => {
  const context = useContext(MistyContext);
  if (!context) {
    throw new Error('useMisty must be used within a MistyProvider');
  }
  return context;
};

export const useMistyContext = useMisty;
