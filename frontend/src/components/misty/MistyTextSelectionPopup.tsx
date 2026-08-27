/**
 * frontend/src/components/misty/MistyTextSelectionPopup.tsx
 * SkyGuard AI — Ask Misty Text Selection Instant Explainer
 * Clean, modern popup matching Ask Misty conversational design with original Misty mascot.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useMisty } from '../../context/MistyContext';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, MessageSquare, X, ChevronRight } from 'lucide-react';
import { queryMistyRag } from '../../data/mistyKnowledge';
import { MistyMarkdown } from '../../utils/mistyMarkdown';
import { MistyCloudAvatar } from './MistyCloudAvatar';

export const MistyTextSelectionPopup: React.FC = () => {
  const { isAwake, askMisty, language, setLanguage, setIsOpen } = useMisty();
  const { isDark } = useTheme();
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAwake) {
      setSelectedText('');
      setSelectionRect(null);
      setIsExpanded(false);
      return;
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (popupRef.current && popupRef.current.contains(e.target as Node)) {
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setTimeout(() => {
          if (!popupRef.current?.contains(document.activeElement)) {
            setSelectedText('');
            setSelectionRect(null);
            setIsExpanded(false);
          }
        }, 150);
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 2 || text.length > 80 || text.includes('\n\n')) {
        setSelectedText('');
        setSelectionRect(null);
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        setSelectedText(text);
        setSelectionRect(rect);
        setIsExpanded(false);
      } catch {
        // Safe fail
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isAwake]);

  // Compute RAG result dynamically based on active selection and language
  const currentRag = React.useMemo(() => {
    if (!selectedText) return null;
    return queryMistyRag(selectedText, language);
  }, [selectedText, language]);

  if (!isAwake || !selectedText || !selectionRect) {
    return null;
  }

  // Calculate clean non-overlapping position
  const popupWidth = isExpanded ? Math.min(360, window.innerWidth - 32) : 260;
  const popupHeight = isExpanded ? 320 : 42;

  // Horizontal position centered on selection, clamped to viewport
  const leftPos = Math.max(16, Math.min(window.innerWidth - popupWidth - 16, selectionRect.left + selectionRect.width / 2 - popupWidth / 2));

  // Vertical position: place above if space permits, otherwise below selection (with 10px clear gap)
  const isAbove = selectionRect.top >= popupHeight + 16;
  const topPos = isAbove ? selectionRect.top - popupHeight - 10 : selectionRect.bottom + 10;

  const handleInstantExplain = () => {
    setIsExpanded(true);
  };

  const handleMoveToChat = () => {
    askMisty(`Tell me about "${selectedText}" and how it works in the weather monitoring system.`, language);
    setIsOpen(true);
    setSelectedText('');
    setSelectionRect(null);
    setIsExpanded(false);
  };

  const explanation = currentRag?.explanation;
  const content = explanation
    ? explanation[language === 'HI' ? 'hi' : language === 'HINGLISH' ? 'hinglish' : 'en']
    : null;
  const fallbackText = currentRag && !explanation ? currentRag.response : null;

  return (
    <div
      ref={popupRef}
      className="fixed z-50 select-none font-sans"
      style={{
        left: `${leftPos}px`,
        top: `${topPos}px`,
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      {!isExpanded ? (
        /* 1. Compact Tooltip */
        <div className="relative group">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-lg transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-200'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-slate-800 p-0.5 shrink-0 flex items-center justify-center">
              <MistyCloudAvatar size="sm" isAwake={isAwake} interactive={false} />
            </div>

            <span
              className={`text-xs font-semibold max-w-[120px] truncate ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}
              title={selectedText}
            >
              &quot;{selectedText}&quot;
            </span>

            {/* Ask Misty Action Pill */}
            <button
              onClick={handleInstantExplain}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#0066FF] hover:bg-blue-600 text-white cursor-pointer transition-all shadow-sm"
              title="Instant Explainer"
            >
              <Sparkles size={11} />
              <span>Ask Misty</span>
            </button>

            {/* Direct to Chat */}
            <button
              onClick={handleMoveToChat}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
              }`}
              title="Open in Chat"
            >
              <MessageSquare size={13} />
            </button>

            {/* Dismiss */}
            <button
              onClick={() => {
                setSelectedText('');
                setSelectionRect(null);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X size={13} />
            </button>
          </div>

          {/* Directional Downward Caret Pointer */}
          {isAbove && (
            <div
              className={`absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-6 ${
                isDark ? 'border-t-slate-900' : 'border-t-white'
              }`}
            />
          )}
        </div>
      ) : (
        /* 2. Expanded Clean Card */
        <div
          className={`w-[360px] max-w-[calc(100vw-32px)] rounded-2xl shadow-2xl p-4 flex flex-col gap-3 border ${
            isDark
              ? 'bg-[#0f141d] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-slate-800 p-0.5 flex items-center justify-center">
                <MistyCloudAvatar size="sm" isAwake={isAwake} interactive={false} />
              </div>
              <div>
                <div className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Ask Misty
                </div>
                <div className="text-[10px] text-blue-500 font-medium truncate max-w-[160px]">
                  {selectedText}
                </div>
              </div>
            </div>

            {/* Language Switcher */}
            <div className={`flex items-center rounded-lg p-0.5 border text-[10px] font-mono ${
              isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              {(['EN', 'HINGLISH', 'HI'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer font-semibold ${
                    language === l
                      ? 'bg-[#0066FF] text-white'
                      : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {l === 'HI' ? 'हिंदी' : l}
                </button>
              ))}
            </div>
          </div>

          {/* Body Content */}
          <div className="max-h-56 overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin text-xs">
            {content ? (
              <>
                <div className={`p-2.5 rounded-xl border leading-relaxed ${
                  isDark ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-blue-50/50 border-blue-100 text-slate-800'
                }`}>
                  <MistyMarkdown content={content.summary} />
                </div>

                <div className={`p-2.5 rounded-xl border leading-relaxed ${
                  isDark ? 'bg-slate-900/50 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <MistyMarkdown content={content.detail} />
                </div>
              </>
            ) : (
              <div className={`p-3 rounded-xl border leading-relaxed ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-800'
              }`}>
                <MistyMarkdown content={fallbackText || ''} />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className={`flex items-center justify-between pt-2 border-t gap-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <button
              onClick={handleMoveToChat}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold bg-[#0066FF] hover:bg-blue-600 text-white shadow-sm transition-all cursor-pointer"
            >
              <MessageSquare size={13} />
              <span>Open in Chat</span>
              <ChevronRight size={13} />
            </button>

            <button
              onClick={() => {
                setSelectedText('');
                setSelectionRect(null);
                setIsExpanded(false);
              }}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
