/**
 * frontend/src/utils/mistyMarkdown.tsx
 * SkyGuard AI — High-Fidelity Markdown & Text Formatter for Misty Clarifier & Chat
 * Eliminates all raw asterisk artifacts (****), renders clean bold, italic, code tags, and bullet lists.
 */

import React from 'react';

interface MistyMarkdownProps {
  content: string;
  className?: string;
}

export const MistyMarkdown: React.FC<MistyMarkdownProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Pre-clean double/quad asterisks without content (e.g. **** or ***)
  const cleanedContent = content
    .replace(/\*{4,}/g, '')
    .replace(/\*\*\s*\*\*/g, '');

  // Split into paragraphs by double newlines or single newlines with bullet points
  const paragraphs = cleanedContent.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  return (
    <div className={`space-y-2 text-slate-200 text-xs leading-relaxed ${className}`}>
      {paragraphs.map((para, pIdx) => {
        // Check if paragraph contains bullet points or list items
        if (para.includes('\n•') || para.startsWith('•') || para.includes('\n- ') || para.startsWith('- ') || para.includes('\n* ') || para.startsWith('* ')) {
          const lines = para.split('\n').filter((l) => l.trim().length > 0);
          return (
            <div key={pIdx} className="space-y-1.5 my-1">
              {lines.map((line, lIdx) => {
                const isBullet = /^[•\-\*]\s+/.test(line);
                const cleanLine = line.replace(/^[•\-\*]\s+/, '').trim();
                return (
                  <div key={lIdx} className="flex items-start gap-2 text-xs">
                    {isBullet && <span className="text-sky-400 font-bold shrink-0 mt-0.5">•</span>}
                    <div className="flex-1 leading-relaxed">{parseInlineFormatting(cleanLine)}</div>
                  </div>
                );
              })}
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={pIdx} className="leading-relaxed">
            {parseInlineFormatting(para)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Parses inline **bold**, *italic*, `code`, and quotes cleanly without leaving raw asterisks.
 */
function parseInlineFormatting(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match:
  // 1. **bold** : \*\*([^*]+?)\*\*
  // 2. *italic* : \*([^*]+?)\*
  // 3. `code`   : `([^`]+?)`
  const tokens = text.split(/(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/g);

  return tokens
    .map((token, idx) => {
      if (!token) return null;

      // Bold: **text**
      if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
        const inner = token.slice(2, -2).trim();
        if (!inner) return null;
        return (
          <strong key={idx} className="text-white font-bold tracking-tight">
            {inner}
          </strong>
        );
      }

      // Italic: *text*
      if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
        const inner = token.slice(1, -1).trim();
        if (!inner) return null;
        return (
          <em key={idx} className="text-sky-300 not-italic font-medium">
            {inner}
          </em>
        );
      }

      // Inline Code: `text`
      if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
        const inner = token.slice(1, -1);
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-[11px] border border-slate-700">
            {inner}
          </code>
        );
      }

      // Normal text: strip any leftover unclosed raw asterisks
      const sanitized = token.replace(/\*{2,}/g, '').replace(/^\*|\*$/g, '');
      return <span key={idx}>{sanitized}</span>;
    })
    .filter(Boolean);
}
