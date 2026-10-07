/**
 * frontend/src/components/misty/MistyChatDrawer.tsx
 * SkyGuard AI — Ask Misty Meteorological Assistant & Conversational Chatbot
 * Clean, modern conversational UI matching modern assistant widget design.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useMisty, MistyLanguage } from '../../context/MistyContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Send,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  Globe,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import { MistyMarkdown } from '../../utils/mistyMarkdown';
import { MistyCloudAvatar } from './MistyCloudAvatar';

const QUICK_ACTIONS = [
  { label: 'Station Status', query: 'Show current station status and active observations' },
  { label: 'Check Alerts', query: 'What anomalies or alerts are currently active?' },
  { label: 'Sensor Health', query: 'How is sensor health calculated and monitored?' },
  { label: 'Simulate Fault', query: 'How does the fault simulator work?' },
  { label: 'Explain Dew Point', query: 'Explain dew point depression in simple terms' },
];

type ResizeDirection =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export const MistyChatDrawer: React.FC = () => {
  const { isDark } = useTheme();
  const {
    isAwake,
    setAwake,
    isOpen,
    setIsOpen,
    toggleOpen,
    language,
    setLanguage,
    messages,
    isThinking,
    askMisty,
    clearChat,
  } = useMisty();

  const [inputVal, setInputVal] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [position, setPosition] = useState<{ x: number; y: number }>(() => ({
    x: typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 420) : 100,
    y: typeof window !== 'undefined' ? Math.max(60, window.innerHeight - 660) : 100,
  }));

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 390,
    height: 590,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [resizingDir, setResizingDir] = useState<ResizeDirection | null>(null);

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  const resizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
    startWidth: 390,
    startHeight: 590,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleWinResize = () => {
      setPosition((pos) => ({
        x: Math.max(10, Math.min(pos.x, window.innerWidth - 360)),
        y: Math.max(60, Math.min(pos.y, window.innerHeight - 380)),
      }));
    };
    window.addEventListener('resize', handleWinResize);
    return () => window.removeEventListener('resize', handleWinResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isThinking]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleDragMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    if ((e.target as HTMLElement).closest('button, input, textarea, a')) return;

    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
  };

  const handleResizeMouseDown = (dir: ResizeDirection, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMaximized) return;

    setResizingDir(dir);
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
      startWidth: size.width,
      startHeight: size.height,
    };
  };

  useEffect(() => {
    if (!isDragging && !resizingDir) return;

    const origUserSelect = document.body.style.userSelect;
    const origCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';

    if (resizingDir) {
      if (resizingDir === 'top' || resizingDir === 'bottom') document.body.style.cursor = 'ns-resize';
      else if (resizingDir === 'left' || resizingDir === 'right') document.body.style.cursor = 'ew-resize';
      else if (resizingDir === 'top-left' || resizingDir === 'bottom-right') document.body.style.cursor = 'nwse-resize';
      else if (resizingDir === 'top-right' || resizingDir === 'bottom-left') document.body.style.cursor = 'nesw-resize';
    } else if (isDragging) {
      document.body.style.cursor = 'grabbing';
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartRef.current.mouseX;
        const deltaY = e.clientY - dragStartRef.current.mouseY;

        const newX = Math.max(10, Math.min(dragStartRef.current.startX + deltaX, window.innerWidth - 120));
        const newY = Math.max(60, Math.min(dragStartRef.current.startY + deltaY, window.innerHeight - 100));

        setPosition({ x: newX, y: newY });
      }

      if (resizingDir) {
        const deltaX = e.clientX - resizeStartRef.current.mouseX;
        const deltaY = e.clientY - resizeStartRef.current.mouseY;
        const minW = 320;
        const minH = 380;
        const maxW = Math.max(minW, window.innerWidth - 20);
        const maxH = Math.max(minH, window.innerHeight - 70);

        let newWidth = resizeStartRef.current.startWidth;
        let newHeight = resizeStartRef.current.startHeight;
        let newX = resizeStartRef.current.startX;
        let newY = resizeStartRef.current.startY;

        if (resizingDir.includes('right')) {
          newWidth = Math.max(minW, Math.min(maxW, resizeStartRef.current.startWidth + deltaX));
        } else if (resizingDir.includes('left')) {
          const rawW = resizeStartRef.current.startWidth - deltaX;
          const clampedW = Math.max(minW, Math.min(maxW, rawW));
          newWidth = clampedW;
          newX = resizeStartRef.current.startX + (resizeStartRef.current.startWidth - clampedW);
        }

        if (resizingDir.includes('bottom')) {
          newHeight = Math.max(minH, Math.min(maxH, resizeStartRef.current.startHeight + deltaY));
        } else if (resizingDir.includes('top')) {
          const rawH = resizeStartRef.current.startHeight - deltaY;
          const clampedH = Math.max(minH, Math.min(maxH, rawH));
          newHeight = clampedH;
          newY = Math.max(60, resizeStartRef.current.startY + (resizeStartRef.current.startHeight - clampedH));
        }

        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setResizingDir(null);
      document.body.style.userSelect = origUserSelect;
      document.body.style.cursor = origCursor;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = origUserSelect;
      document.body.style.cursor = origCursor;
    };
  }, [isDragging, resizingDir]);

  if (!isAwake) {
    return null;
  }

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;
    askMisty(inputVal.trim(), language);
    setInputVal('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* ══ 1. FLOATING CLOUD MASCOT BUTTON (Bottom Right) ═════════════ */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 select-none">
          <div
            onClick={toggleOpen}
            className="cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 drop-shadow-[0_10px_25px_rgba(0,102,255,0.4)] filter"
            title="Ask Misty"
            aria-label="Ask Misty"
          >
            <MistyCloudAvatar size="xl" isAwake={isAwake} showSleepZzz={true} />
          </div>
        </div>
      )}

      {/* ══ 2. CHAT WINDOW ═════════════════════════════════════════════ */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col rounded-2xl sm:rounded-3xl shadow-2xl transition-[border-color,box-shadow] select-none font-sans overflow-hidden ${
            isDark
              ? 'bg-[#0f141d] text-slate-100 border border-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]'
              : 'bg-white text-slate-900 border border-slate-200/90 shadow-[0_20px_45px_-10px_rgba(0,102,255,0.2)]'
          }`}
          style={
            isMobile
              ? { top: '56px', left: '8px', right: '8px', bottom: '8px', width: 'auto', height: 'auto' }
              : isMaximized
              ? { top: '64px', left: '16px', right: '16px', bottom: '16px', width: 'auto', height: 'auto' }
              : {
                  top: `${position.y}px`,
                  left: `${position.x}px`,
                  width: `${size.width}px`,
                  height: `${size.height}px`,
                }
          }
        >
          {/* ── 8 RESIZE HANDLES (Desktop Only) ────────────────── */}
          {!isMaximized && !isMobile && (
            <>
              <div
                onMouseDown={(e) => handleResizeMouseDown('top', e)}
                className="absolute -top-1.5 left-5 right-5 h-3.5 cursor-ns-resize z-50"
              />
              <div
                onMouseDown={(e) => handleResizeMouseDown('bottom', e)}
                className="absolute -bottom-1.5 left-5 right-5 h-3.5 cursor-ns-resize z-50"
              />
              <div
                onMouseDown={(e) => handleResizeMouseDown('left', e)}
                className="absolute -left-1.5 top-5 bottom-5 w-3.5 cursor-ew-resize z-50"
              />
              <div
                onMouseDown={(e) => handleResizeMouseDown('right', e)}
                className="absolute -right-1.5 top-5 bottom-5 w-3.5 cursor-ew-resize z-50"
              />
              <div
                onMouseDown={(e) => handleResizeMouseDown('top-left', e)}
                className="absolute -top-1.5 -left-1.5 w-6 h-6 cursor-nwse-resize z-50"
              />
              <div
                onMouseDown={(e) => handleResizeMouseDown('top-right', e)}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 cursor-nesw-resize z-50"
              />
              <div
                onMouseDown={(e) => handleResizeMouseDown('bottom-left', e)}
                className="absolute -bottom-1.5 -left-1.5 w-6 h-6 cursor-nesw-resize z-50"
              />
              <div
                onMouseDown={(e) => handleResizeMouseDown('bottom-right', e)}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 cursor-nwse-resize z-50"
              />
            </>
          )}

          {/* ── TOP VIBRANT BLUE HEADER WITH ORGANIC CURVE ──────── */}
          <div
            onMouseDown={handleDragMouseDown}
            onDoubleClick={() => setIsMaximized((m) => !m)}
            className={`relative bg-gradient-to-r from-blue-600 via-blue-600 to-sky-500 text-white shrink-0 select-none pb-6 ${
              isMaximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
            }`}
          >
            {/* Header Content Bar */}
            <div className="px-5 pt-4 pb-2 flex items-center justify-between">
              {/* Left: Original Misty Avatar Icon + Simple Title */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md p-1 border-2 border-white/60 flex items-center justify-center shadow-md">
                    <MistyCloudAvatar size="sm" isAwake={isAwake} interactive={false} />
                  </div>
                  {/* Status Indicator */}
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-blue-600 rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight text-white leading-tight">
                    Ask Misty
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-blue-100 font-medium mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span>We&apos;re online</span>
                  </div>
                </div>
              </div>

              {/* Right: Controls (Language Selector, Clear, Maximize, Minimize) */}
              <div className="flex items-center gap-1.5">
                {/* Language Switcher Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowLangMenu((prev) => !prev)}
                    className="px-2 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    title="Change Language"
                  >
                    <Globe size={13} />
                    <span>{language}</span>
                  </button>

                  {/* Language Popover Menu */}
                  {showLangMenu && (
                    <div
                      className={`absolute right-0 top-9 w-36 rounded-xl shadow-2xl py-1 text-xs border z-50 ${
                        isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      {(['EN', 'HINGLISH', 'HI'] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => {
                            setLanguage(l);
                            setShowLangMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer ${
                            language === l ? 'font-bold text-blue-600 dark:text-blue-400' : ''
                          }`}
                        >
                          <span>{l === 'HI' ? 'हिंदी (Hindi)' : l === 'HINGLISH' ? 'Hinglish' : 'English'}</span>
                          {language === l && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reset / Clear Chat */}
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
                  title="Reset conversation"
                >
                  <RotateCcw size={16} />
                </button>

                {/* Maximize Toggle */}
                <button
                  onClick={() => setIsMaximized((m) => !m)}
                  className="hidden sm:inline-flex p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
                  title={isMaximized ? 'Restore' : 'Maximize'}
                >
                  {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>

                {/* Minimize / Close Dropdown Chevron */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
                  title="Minimize"
                >
                  <ChevronDown size={20} />
                </button>
              </div>
            </div>

            {/* Smooth Wave SVG Curve Transition (Matching Reference Template) */}
            <div className="absolute -bottom-[1px] left-0 right-0 w-full overflow-hidden leading-none pointer-events-none">
              <svg
                viewBox="0 0 500 40"
                preserveAspectRatio="none"
                className={`w-full h-5 ${isDark ? 'fill-[#0f141d]' : 'fill-white'}`}
              >
                <path d="M0,0 C150,38 350,-10 500,25 L500,40 L0,40 Z" />
              </svg>
            </div>
          </div>

          {/* ── QUICK ACTION PILLS (Under Header) ────────────────── */}
          <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 z-10">
            {QUICK_ACTIONS.map((action, idx) => (
              <button
                key={idx}
                onClick={() => askMisty(action.query, language)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-all border shrink-0 ${
                  isDark
                    ? 'bg-slate-800/80 hover:bg-blue-600/30 border-slate-700/80 hover:border-blue-500 text-slate-200 hover:text-white'
                    : 'bg-blue-50/70 hover:bg-blue-100 border-blue-200/80 hover:border-blue-400 text-blue-700 hover:text-blue-900 shadow-xs'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* ── MESSAGE STREAM ──────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin select-text">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Bot Message Row (Clean, no left vertical bar) */}
                {msg.sender === 'misty' ? (
                  <div className="flex items-start gap-2.5 max-w-[88%]">
                    {/* Small Original Misty Mascot Icon */}
                    <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 flex items-center justify-center p-0.5 shadow-xs">
                      <MistyCloudAvatar size="sm" isAwake={isAwake} interactive={false} />
                    </div>

                    {/* Bot Bubble */}
                    <div className="space-y-1.5 flex-1">
                      <div
                        className={`p-3.5 rounded-2xl rounded-tl-xs shadow-xs text-sm leading-relaxed border ${
                          isDark
                            ? 'bg-slate-800/90 text-slate-100 border-slate-700/70'
                            : 'bg-white text-slate-800 border-slate-200/90'
                        }`}
                      >
                        <MistyMarkdown content={msg.text} />
                      </div>

                      {/* Follow-up Question Pill Buttons */}
                      {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.suggestedQuestions.map((q, qIdx) => (
                            <button
                              key={qIdx}
                              onClick={() => askMisty(q, language)}
                              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer border ${
                                isDark
                                  ? 'bg-slate-800 hover:bg-blue-600/30 border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white'
                                  : 'bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-400 text-blue-700 hover:text-blue-900 shadow-xs'
                              }`}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Subtitle & Copy */}
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                        <span>Ask Misty • {msg.timestamp}</span>
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? <Check size={11} className="text-emerald-500 inline" /> : <Copy size={11} className="inline" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* User Message Bubble */
                  <div className="max-w-[82%] space-y-1">
                    <div className="bg-[#0066FF] text-white p-3.5 rounded-2xl rounded-tr-xs shadow-sm text-sm font-normal leading-relaxed">
                      {msg.text}
                    </div>
                    <div className="text-[10px] text-slate-400 text-right px-1">
                      {msg.timestamp}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Typing State (Matches Lyro AI template) */}
            {isThinking && (
              <div className="flex items-start gap-2.5 max-w-[85%]">
                <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 flex items-center justify-center p-0.5">
                  <MistyCloudAvatar size="sm" isAwake={isAwake} interactive={false} />
                </div>
                <div
                  className={`px-4 py-2.5 rounded-2xl rounded-tl-xs shadow-xs text-xs font-medium flex items-center gap-2 border ${
                    isDark
                      ? 'bg-slate-800/90 text-blue-300 border-slate-700/70'
                      : 'bg-white text-blue-700 border-slate-200/90'
                  }`}
                >
                  <span>Misty is thinking</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── BOTTOM INPUT FOOTER ─────────────────────────────── */}
          <div className={`p-3 border-t shrink-0 ${isDark ? 'bg-[#0f141d] border-slate-800' : 'bg-white border-slate-100'}`}>
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={
                  language === 'HI'
                    ? 'एक संदेश लिखें...'
                    : language === 'HINGLISH'
                    ? 'Ek message type karein...'
                    : 'Type a message...'
                }
                className={`flex-1 px-4 py-2.5 rounded-full text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />

              <button
                type="submit"
                disabled={!inputVal.trim() || isThinking}
                className="w-10 h-10 rounded-full bg-[#0066FF] hover:bg-blue-600 disabled:opacity-40 disabled:pointer-events-none text-white flex items-center justify-center shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
                title="Send"
              >
                <Send size={16} />
              </button>
            </form>

            <div className="text-[10px] text-center text-slate-400 font-medium mt-1.5">
              POWERED BY <span className="font-bold text-blue-600 dark:text-blue-400">SkyGuard AI</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
