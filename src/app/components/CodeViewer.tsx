import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  highlightLines?: number[];
}

export function CodeViewer({ code, language = 'tcl', title, highlightLines = [] }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className="rounded-lg overflow-hidden border" style={{ border: '1px solid var(--stone-ridge)', background: '#0D1117' }}>
      {(title || language) && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#161B22' }}>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70" />
            </div>
            {title && <span className="text-xs ml-2" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>{title}</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
              {language}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: copied ? '#10B981' : 'rgba(255,255,255,0.4)' }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
          {lines.map((line, i) => (
            <div
              key={i}
              className="flex"
              style={{
                background: highlightLines.includes(i + 1) ? 'rgba(194,65,12,0.15)' : 'transparent',
                borderLeft: highlightLines.includes(i + 1) ? '2px solid var(--topography-rust)' : '2px solid transparent',
              }}
            >
              <span className="select-none w-10 text-right pr-4 shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {i + 1}
              </span>
              <span style={{ color: '#E6EDF3' }}>{line}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
