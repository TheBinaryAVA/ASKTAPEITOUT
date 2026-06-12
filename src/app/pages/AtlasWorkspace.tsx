import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { Send, Plus, ChevronRight, ExternalLink, BookOpen, Users, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { ConfidenceMeter } from '../components/ConfidenceMeter';
import { StatusBadge } from '../components/StatusBadge';
import { CodeViewer } from '../components/CodeViewer';

type AtlasStatus = 'idle' | 'analyzing' | 'charting' | 'fixed';

interface Message {
  id: number;
  role: 'user' | 'atlas';
  content: string;
  status?: AtlasStatus;
  analysis?: {
    confidence: number;
    rootCause: string;
    recommendation: string;
    evidence: string[];
    expectedResult: string;
  };
}

const exampleQueries = [
  'What caused my CTS failure?',
  'Why do I have hold violations after placement?',
  'How do I fix routing congestion on metal3?',
  'Antenna violations on VIA2 — root cause?',
];

const initialMessages: Message[] = [
  {
    id: 1,
    role: 'atlas',
    content: 'Hello. I\'m Atlas — your implementation intelligence guide. Describe your failure, paste your error log, or ask about any RTL-to-GDSII issue. I\'ll map the path forward.',
    status: 'idle',
  },
];

const sources = [
  { type: 'doc', title: 'OpenROAD CTS Documentation', url: '#' },
  { type: 'community', title: '2,847 similar diagnoses', url: '#' },
  { type: 'failure', title: 'CTS-0008 Failure Pattern', url: '/atlas/error/cts-0008' },
  { type: 'doc', title: 'SDC Constraint Reference', url: '#' },
];

export function AtlasWorkspace() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<AtlasStatus>('idle');
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const simulateAtlasResponse = async (query: string) => {
    setStatus('analyzing');
    const thinkingId = Date.now();

    setMessages(prev => [...prev, {
      id: thinkingId,
      role: 'atlas',
      content: '',
      status: 'analyzing',
    }]);

    await new Promise(r => setTimeout(r, 1200));
    setStatus('charting');
    setMessages(prev => prev.map(m => m.id === thinkingId ? { ...m, status: 'charting' } : m));

    await new Promise(r => setTimeout(r, 1400));
    setStatus('fixed');

    const analysis = {
      confidence: 94,
      rootCause: 'Missing create_clock constraint in SDC file. OpenROAD\'s CTS engine requires an explicit clock definition to identify the clock source and build the clock tree topology.',
      recommendation: 'Add create_clock -name clk -period 10.0 [get_ports clk] to your constraints.sdc file. Ensure the port name matches the actual clock input in your netlist.',
      evidence: [
        'Error code CTS-0008 exclusively triggered by missing clock definition',
        'SDC references "clk" in set_input_delay without prior create_clock',
        'Pattern matches 2,847 documented instances in Atlas database',
      ],
      expectedResult: 'CTS will proceed successfully once the clock constraint is defined. Expect 15–30 minute runtime on a design of this complexity.',
    };

    setMessages(prev => prev.map(m => m.id === thinkingId ? {
      ...m,
      content: `I've analyzed your query against 47,000+ tapeout failure patterns. Here's what Atlas found:`,
      status: 'fixed',
      analysis,
    } : m));

    setStatus('idle');
    setConversationHistory(prev => [...prev, query]);
  };

  const handleSend = async () => {
    if (!input.trim() || status !== 'idle') return;
    const query = input.trim();
    setInput('');

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: query }]);
    await simulateAtlasResponse(query);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden" style={{ background: 'transparent' }}>
      {/* Left - Conversation History */}
      <aside className="w-56 border-r flex flex-col hidden md:flex" style={{ background: 'var(--abyss-ink)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(243,242,237,0.7)' }}>
            <Plus className="w-4 h-4" /> New Analysis
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-xs font-semibold mb-3 px-2" style={{ color: 'rgba(243,242,237,0.3)', letterSpacing: '0.08em' }}>RECENT</p>
          {['CTS-0008 in Sky130', 'Hold violations GF180', 'Metal3 congestion', 'LVS floating gate'].map((item, i) => (
            <button key={i} className="w-full text-left px-3 py-2 rounded-lg text-xs mb-1 transition-colors" style={{ color: i === 0 ? 'var(--meridian-gold)' : 'rgba(243,242,237,0.5)', background: i === 0 ? 'rgba(212,175,55,0.1)' : 'transparent' }}>
              {item}
            </button>
          ))}
        </div>

        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs" style={{ color: 'rgba(243,242,237,0.4)' }}>Atlas Online</span>
          </div>
        </div>
      </aside>

      {/* Center - Atlas Workspace */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Atlas Status Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b" style={{ background: '#FFFFFF', borderColor: 'var(--stone-ridge)' }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: 'var(--abyss-ink)' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--meridian-gold)', fontFamily: 'var(--font-mono)' }}>A</span>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--abyss-ink)' }}>Atlas AI Workspace</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Implementation Intelligence — RTL to GDSII</p>
            </div>
          </div>
          <StatusBadge status={status === 'idle' ? 'fixed' : status === 'analyzing' ? 'analyzing' : status === 'charting' ? 'charting' : 'fixed'} pulse={status !== 'idle'} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'atlas' && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1" style={{ background: 'var(--abyss-ink)' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--meridian-gold)', fontFamily: 'var(--font-mono)' }}>A</span>
                </div>
              )}

              <div className={`max-w-2xl ${msg.role === 'user' ? 'order-first' : ''}`}>
                {msg.role === 'user' ? (
                  <div className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm" style={{ background: 'var(--abyss-ink)', color: '#F3F2ED' }}>
                    {msg.content}
                  </div>
                ) : msg.status === 'analyzing' || msg.status === 'charting' ? (
                  <div className="px-5 py-4 rounded-2xl rounded-tl-sm" style={{ background: '#FFFFFF', border: '1px solid var(--stone-ridge)' }}>
                    <div className="flex items-center gap-3">
                      <Loader className="w-4 h-4 animate-spin" style={{ color: 'var(--meridian-gold)' }} />
                      <div>
                        <StatusBadge status={msg.status} pulse />
                        <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                          {msg.status === 'analyzing' ? 'Parsing error context and log signatures...' : 'Cross-referencing 47,000+ tapeout patterns...'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="px-5 py-4 rounded-2xl rounded-tl-sm" style={{ background: '#FFFFFF', border: '1px solid var(--stone-ridge)' }}>
                      <p className="text-sm mb-1" style={{ color: '#475569' }}>{msg.content}</p>
                      {msg.status === 'fixed' && <StatusBadge status="fixed" />}
                    </div>

                    {msg.analysis && (
                      <div className="rounded-xl overflow-hidden border" style={{ border: '1px solid var(--stone-ridge)' }}>
                        <div className="px-5 py-3 border-b" style={{ background: 'var(--abyss-ink)', borderColor: 'rgba(255,255,255,0.08)' }}>
                          <p className="text-xs font-semibold text-white">Atlas Diagnosis</p>
                        </div>
                        <div className="p-5 space-y-4" style={{ background: '#FAFAF7' }}>
                          <ConfidenceMeter score={msg.analysis.confidence} />

                          <div>
                            <p className="text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>Root Cause</p>
                            <p className="text-sm leading-relaxed" style={{ color: '#374151', fontFamily: 'var(--font-editorial)' }}>{msg.analysis.rootCause}</p>
                          </div>

                          <div className="rounded-lg p-3" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--meridian-gold)' }}>RECOMMENDATION</p>
                            <p className="text-sm" style={{ color: '#374151' }}>{msg.analysis.recommendation}</p>
                          </div>

                          <div>
                            <p className="text-xs font-medium mb-2" style={{ color: '#94A3B8' }}>Evidence</p>
                            <ul className="space-y-1.5">
                              {msg.analysis.evidence.map((e, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: '#475569' }}>
                                  <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#10B981' }} />
                                  {e}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-lg p-3" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: '#10B981' }}>EXPECTED RESULT</p>
                            <p className="text-xs" style={{ color: '#374151' }}>{msg.analysis.expectedResult}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="px-3 py-1.5 rounded-full text-xs transition-colors"
                  style={{ background: '#FFFFFF', border: '1px solid var(--stone-ridge)', color: '#475569' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-6 pb-6">
          <div className="flex items-end gap-3 rounded-xl p-3" style={{ background: '#FFFFFF', border: '1.5px solid var(--stone-ridge)' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Describe your implementation failure, paste error logs, or ask Atlas anything..."
              rows={2}
              className="flex-1 resize-none outline-none text-sm bg-transparent"
              style={{ color: 'var(--abyss-ink)', fontFamily: 'var(--font-ui)', lineHeight: 1.5 }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || status !== 'idle'}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all shrink-0"
              style={{
                background: input.trim() && status === 'idle' ? 'var(--abyss-ink)' : 'var(--secondary)',
                color: input.trim() && status === 'idle' ? 'var(--canvas-bone)' : '#94A3B8',
              }}
            >
              {status !== 'idle' ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs mt-2 text-center" style={{ color: '#94A3B8' }}>Atlas analyzes against 47,000+ tapeout failures · Not a substitute for expert review</p>
        </div>
      </main>

      {/* Right - Sources */}
      <aside className="w-64 border-l flex flex-col hidden lg:flex" style={{ background: '#FFFFFF', borderColor: 'var(--stone-ridge)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--stone-ridge)' }}>
          <h3 className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#94A3B8' }}>Sources & Context</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div>
            <p className="text-xs font-medium mb-3" style={{ color: '#64748B' }}>Referenced Sources</p>
            <div className="space-y-2">
              {sources.map((s, i) => (
                <a key={i} href={s.url} className="flex items-start gap-2 p-2.5 rounded-lg text-xs group transition-colors" style={{ background: 'var(--canvas-bone)', border: '1px solid var(--stone-ridge)' }}>
                  {s.type === 'doc' ? <BookOpen className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#64748B' }} />
                    : s.type === 'community' ? <Users className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#64748B' }} />
                    : <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--topography-rust)' }} />}
                  <span className="group-hover:underline leading-relaxed" style={{ color: '#475569' }}>{s.title}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="h-px" style={{ background: 'var(--stone-ridge)' }} />

          <div>
            <p className="text-xs font-medium mb-3" style={{ color: '#64748B' }}>Related Failures</p>
            <div className="space-y-1.5">
              {['CTS-0007', 'CTS-0009', 'SDC-0012', 'CTS-0001'].map(err => (
                <Link key={err} to={`/atlas/error/${err.toLowerCase()}`} className="flex items-center justify-between p-2 rounded text-xs group" style={{ color: '#475569' }}>
                  <span className="group-hover:underline" style={{ fontFamily: 'var(--font-mono)' }}>{err}</span>
                  <ChevronRight className="w-3 h-3" style={{ color: '#D1D5DB' }} />
                </Link>
              ))}
            </div>
          </div>

          <div className="h-px" style={{ background: 'var(--stone-ridge)' }} />

          <div>
            <p className="text-xs font-medium mb-3" style={{ color: '#64748B' }}>Knowledge Graph</p>
            <div className="rounded-lg p-3 text-center" style={{ background: 'var(--canvas-bone)', border: '1px solid var(--stone-ridge)' }}>
              <p className="text-xs mb-2" style={{ color: '#94A3B8' }}>3 connected nodes found</p>
              <Link to="/knowledge-graph" className="text-xs font-medium" style={{ color: 'var(--meridian-gold)' }}>
                View in Graph →
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
