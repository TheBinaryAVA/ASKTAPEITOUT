import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router';
import { 
  CheckCircle, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  ArrowRight, 
  Users, 
  Eye, 
  Clock,
  Send,
  AlertTriangle,
  Play,
  Edit3,
  Cpu,
  LineChart,
  BarChart,
  Code,
  FileText,
  Terminal,
  Activity,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { ConfidenceMeter } from '../components/ConfidenceMeter';
import { StatusBadge } from '../components/StatusBadge';
import { CodeViewer } from '../components/CodeViewer';
import { 
  getQuestionById, 
  updateQuestionVotes, 
  addAnswerToQuestion, 
  verifyAnswerInQuestion,
  Question, 
  Answer 
} from '../data/questionsData';

export function QuestionDetail() {
  const { slug } = useParams();
  const questionId = parseInt(slug || '', 10);
  
  const [question, setQuestion] = useState<Question | null>(null);
  
  // Hardware-Native Tabs
  // RTL, Constraints, Waveform, Telemetry, Atlas, Discussions
  const [activeTab, setActiveTab] = useState<'atlas' | 'rtl' | 'constraints' | 'waveform' | 'telemetry' | 'discussion'>('atlas');
  
  // Interactive Answering state
  const [newAnswerText, setNewAnswerText] = useState('');
  const [newAuthor, setNewAuthor] = useState('Guest Engineer');
  const [isSolutionInput, setIsSolutionInput] = useState(false);

  // Fork & Verify Sandbox State
  const [isSandboxEditing, setIsSandboxEditing] = useState(false);
  const [sandboxCode, setSandboxCode] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisLogs, setSynthesisLogs] = useState<string[]>([]);
  const [synthesisSuccess, setSynthesisSuccess] = useState<boolean | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Waveform Viewer State
  const [zoomFactor, setZoomFactor] = useState(1); // 1 = normal, 2 = zoom in, 0.5 = zoom out
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [measurementPoint, setMeasurementPoint] = useState<{ t1: number; t2: number } | null>(null);

  useEffect(() => {
    if (!isNaN(questionId)) {
      const q = getQuestionById(questionId);
      if (q) {
        setQuestion(q);
        setSandboxCode(q.verilog || '');
      }
    }
  }, [questionId]);

  useEffect(() => {
    if (isSynthesizing) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [synthesisLogs, isSynthesizing]);

  if (!question) {
    return (
      <div style={{ background: 'transparent', minHeight: '100vh', fontFamily: 'var(--font-ui)' }} className="flex flex-col items-center justify-center p-8">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--abyss-ink)' }}>
          Question Not Found
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
          The semiconductor failure case you are trying to view does not exist.
        </p>
        <Link 
          to="/community" 
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:scale-102"
          style={{ background: 'var(--abyss-ink)' }}
        >
          Back to Q&A Board
        </Link>
      </div>
    );
  }

  const handleUpvoteQuestion = () => {
    const updated = updateQuestionVotes(question.id, 1);
    const updatedQ = updated.find(q => q.id === question.id);
    if (updatedQ) {
      setQuestion(updatedQ);
    }
  };

  const handlePostAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerText.trim()) return;

    const newAns: Answer = {
      author: newAuthor.trim() || 'Anonymous Engineer',
      time: 'Just now',
      body: newAnswerText.trim(),
      votes: 0,
      isSolution: isSolutionInput,
      isVerified: false
    };

    const updated = addAnswerToQuestion(question.id, newAns);
    const updatedQ = updated.find(q => q.id === question.id);
    if (updatedQ) {
      setQuestion(updatedQ);
    }

    setNewAnswerText('');
    setIsSolutionInput(false);
  };

  // Fork & Verify Sandbox Simulation
  const handleRunSynthesis = () => {
    setIsSynthesizing(true);
    setSynthesisSuccess(null);
    setSynthesisLogs([]);

    const logLines = [
      '[INFO] Initializing headless Yosys compilation container...',
      `[INFO] Loading PDK technology cell library: ${question.node}_fd_sc_hd...`,
      '[INFO] Parsing Verilog module input...',
      '[INFO] Elaborating module structure...',
      '[INFO] Generating gate-level netlist...',
      '[INFO] Launching OpenROAD timing verification...',
      '[INFO] Evaluating SDC timing constraints setup/hold margins...',
      '[INFO] Checking for clock-domain crossing (CDC) setup paths...'
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < logLines.length) {
        setSynthesisLogs(prev => [...prev, logLines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        
        // Mock compilation outcome: if the SDC has "create_clock" or they modified it to include a clock, it succeeds!
        const hasClockFix = sandboxCode.includes('create_clock') || question.solved;
        setTimeout(() => {
          if (hasClockFix) {
            setSynthesisLogs(prev => [
              ...prev,
              '[SUCCESS] Synthesis complete! Netlist generated successfully.',
              '[SUCCESS] Timing closure reached: Slack met (+0.45ns).',
              `[SUCCESS] Verified clock frequency: 154.2 MHz (Target PDK Frequency: 100 MHz).`,
              '[SUCCESS] Headless compute run verified. Adding VERIFIED BADGE.'
            ]);
            setSynthesisSuccess(true);
            setIsSynthesizing(false);
            
            // Mark solution as verified in state
            const updated = verifyAnswerInQuestion(question.id, 0); // verify the first answer for simulation
            const updatedQ = updated.find(q => q.id === question.id);
            if (updatedQ) {
              setQuestion(updatedQ);
            }
          } else {
            setSynthesisLogs(prev => [
              ...prev,
              '[ERROR] Synthesis failed! No clock tree path could be generated.',
              '[ERROR] CDC check: Unsynchronized signal path detected.',
              '[ERROR] Timing closure: FAILED (Hold slack violation: -0.23ns).',
              '[ERROR] Headless run aborted. Check your clock constraints.'
            ]);
            setSynthesisSuccess(false);
            setIsSynthesizing(false);
          }
        }, 800);
      }
    }, 450);
  };

  const solution = question.answers.find(a => a.isSolution);

  // Waveform drawing math
  const widthBase = 680 * zoomFactor;
  const signalHeight = 35;
  const spacing = 15;

  const handleWaveformClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const timeVal = Math.round((x / widthBase) * 100); // 0 to 100ns timeline
    setSelectedTime(timeVal);

    // Dynamic delay measurement simulation (Tpd)
    if (measurementPoint === null) {
      setMeasurementPoint({ t1: timeVal, t2: timeVal + 12 });
    } else {
      setMeasurementPoint(null);
    }
  };

  const handleWaveformMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const timeVal = Math.round((x / widthBase) * 100);
    setHoveredTime(timeVal);
  };

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', fontFamily: 'var(--font-ui)' }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs" style={{ color: '#94A3B8' }}>
              <Link to="/" style={{ color: '#94A3B8' }} className="hover:underline">Home</Link>
              <span>/</span>
              <Link to="/community" style={{ color: '#94A3B8' }} className="hover:underline">Community</Link>
              <span>/</span>
              <span style={{ color: '#475569' }}>Q-{question.id}</span>
            </div>

            {/* Question Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <StatusBadge status={question.solved ? 'fixed' : 'analyzing'} />
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                  question.severity === 'Critical' ? 'bg-red-50 text-red-600 border-red-200' :
                  question.severity === 'High' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  'bg-blue-50 text-blue-600 border-blue-200'
                }`}>
                  {question.severity}
                </span>
                
                {/* 4D Taxonomy Badges */}
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold border border-indigo-200 bg-indigo-50 text-indigo-700">
                  Domain: {question.domain}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold border border-amber-200 bg-amber-50 text-amber-700">
                  Node: {question.node}
                </span>
              </div>

              <h1 className="mb-4 leading-tight text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--abyss-ink)' }}>
                {question.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs pb-4 border-b border-gray-200" style={{ color: '#94A3B8' }}>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{question.views.toLocaleString()} views</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Asked by <strong className="text-gray-600">{question.author}</strong></span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{question.date}</span>
                
                <button 
                  onClick={handleUpvoteQuestion} 
                  className="flex items-center gap-1 hover:text-amber-500 transition-colors ml-auto bg-white border px-2 py-1 rounded text-[11px] font-semibold cursor-pointer shadow-xs"
                  style={{ borderColor: 'var(--stone-ridge)', color: '#475569' }}
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-amber-500" /> Upvote ({question.votes})
                </button>
              </div>
            </div>

            {/* Hardware-Native Tabs Switcher */}
            <div className="flex flex-wrap border-b border-gray-200" style={{ borderColor: 'var(--stone-ridge)' }}>
              {[
                { id: 'atlas', label: 'Atlas AI Diagnosis', icon: Cpu },
                { id: 'rtl', label: 'RTL Sandbox', icon: Code },
                { id: 'constraints', label: 'Timing Constraints', icon: FileText },
                { id: 'waveform', label: 'Waveform Viewer', icon: LineChart },
                { id: 'telemetry', label: 'Telemetry', icon: Activity },
                { id: 'discussion', label: `Discussions (${question.answers.length})`, icon: MessageSquare }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className="px-4 py-3 text-xs font-semibold capitalize transition-all border-b-2 -mb-px flex items-center gap-1.5 cursor-pointer"
                    style={{
                      borderColor: activeTab === tab.id ? 'var(--abyss-ink)' : 'transparent',
                      color: activeTab === tab.id ? 'var(--abyss-ink)' : '#94A3B8',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: ATLAS AI DIAGNOSIS                                                 */}
            {/* ========================================================================= */}
            {activeTab === 'atlas' && question.atlasAnalysis && (
              <div className="space-y-6">
                <div className="rounded-xl overflow-hidden border shadow-sm" style={{ border: '1px solid var(--stone-ridge)' }}>
                  <div className="px-5 py-4 flex items-center justify-between border-b" style={{ background: 'var(--abyss-ink)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded flex items-center justify-center animate-pulse" style={{ background: 'var(--meridian-gold)' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--abyss-ink)', fontFamily: 'var(--font-mono)' }}>A</span>
                      </div>
                      <span className="text-sm font-semibold text-white">Atlas Automated Diagnosis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: 'rgba(243,242,237,0.5)' }}>Seen {question.atlasAnalysis.seenCount.toLocaleString()} times</span>
                      <StatusBadge status={question.solved ? 'fixed' : 'analyzing'} />
                    </div>
                  </div>

                  <div className="p-5 space-y-5" style={{ background: '#FAFAF7' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">Detected Failure Signature</p>
                        <p className="text-sm font-bold font-mono" style={{ color: 'var(--topography-rust)' }}>{question.atlasAnalysis.failure}</p>
                      </div>
                      <div>
                        <ConfidenceMeter score={question.atlasAnalysis.confidence} />
                      </div>
                    </div>

                    <div className="h-px" style={{ background: 'var(--stone-ridge)' }} />

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">Root Cause Analysis</p>
                      <p className="text-sm leading-relaxed text-gray-700 font-editorial">{question.atlasAnalysis.rootCause}</p>
                    </div>

                    <div className="rounded-lg p-4" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                      <p className="text-xs font-bold mb-2" style={{ color: 'var(--meridian-gold)' }}>ATLAS RECOMMENDED FIX</p>
                      <p className="text-sm text-gray-800 font-ui font-medium">{question.atlasAnalysis.recommendation}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg p-3 text-center bg-emerald-50/50 border border-emerald-100">
                        <div className="text-xl font-bold mb-0.5 text-emerald-600" style={{ fontFamily: 'var(--font-display)' }}>{question.atlasAnalysis.successRate}%</div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Community Success Rate</p>
                      </div>
                      <div className="rounded-lg p-3 text-center bg-gray-50 border" style={{ borderColor: 'var(--stone-ridge)' }}>
                        <div className="text-xl font-bold mb-0.5 text-gray-700" style={{ fontFamily: 'var(--font-display)' }}>{question.atlasAnalysis.seenCount.toLocaleString()}</div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Verified Tapeouts</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-6 bg-white shadow-sm" style={{ borderColor: 'var(--stone-ridge)' }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-gray-400">Original Question Summary</h3>
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{question.body}</p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: RTL SANDBOX & "FORK & VERIFY" SIMULATOR                            */}
            {/* ========================================================================= */}
            {activeTab === 'rtl' && (
              <div className="space-y-6">
                <div className="rounded-xl border bg-white overflow-hidden shadow-sm" style={{ borderColor: 'var(--stone-ridge)' }}>
                  <div className="px-5 py-3 bg-gray-50 border-b flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-blue-500" /> RTL Source Sandbox (Active Compute Layer)
                      </h3>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsSandboxEditing(!isSandboxEditing)}
                        className={`text-xs font-semibold py-1 px-3 rounded border flex items-center gap-1 cursor-pointer transition-colors ${
                          isSandboxEditing 
                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        {isSandboxEditing ? 'Lock Code' : 'Fork & Edit Logic'}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed relative">
                    {isSandboxEditing ? (
                      <textarea
                        rows={12}
                        value={sandboxCode}
                        onChange={e => setSandboxCode(e.target.value)}
                        className="w-full bg-slate-800 text-emerald-400 p-3 rounded font-mono outline-none border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    ) : (
                      <pre className="overflow-x-auto text-emerald-400 p-2">{sandboxCode}</pre>
                    )}
                  </div>

                  {/* ACTIVE COMPUTE CONTROL BUTTON */}
                  <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1.5 font-medium">
                      <Terminal className="w-3.5 h-3.5" /> Powered by Yosys / OpenROAD Headless container
                    </span>
                    <button
                      onClick={handleRunSynthesis}
                      disabled={isSynthesizing || !sandboxCode.trim()}
                      className="px-4 py-2 bg-[#0F172A] text-white hover:bg-slate-800 disabled:opacity-50 text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 text-[#D4AF37]" /> Run Synthesis & Verify
                    </button>
                  </div>
                </div>

                {/* SIMULATED TERMINAL CONSOLE LOGS */}
                {(synthesisLogs.length > 0 || isSynthesizing) && (
                  <div className="rounded-xl border bg-slate-950 text-slate-100 overflow-hidden font-mono text-[11px] shadow-lg">
                    <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-[#D4AF37]" /> Verification Console Log
                      </span>
                      {isSynthesizing ? (
                        <span className="flex items-center gap-1.5 text-amber-500 animate-pulse font-semibold">
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" /> Synthesis Running...
                        </span>
                      ) : synthesisSuccess ? (
                        <span className="text-emerald-500 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Verification Passed
                        </span>
                      ) : (
                        <span className="text-red-500 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Verification Failed
                        </span>
                      )}
                    </div>
                    
                    <div className="p-4 space-y-1.5 max-h-[200px] overflow-y-auto min-h-[120px]">
                      {synthesisLogs.map((log, idx) => {
                        if (!log) return null;
                        let colorClass = 'text-slate-300';
                        if (log.startsWith('[SUCCESS]')) colorClass = 'text-emerald-400 font-semibold';
                        if (log.startsWith('[ERROR]')) colorClass = 'text-red-400 font-semibold';
                        if (log.startsWith('[INFO]')) colorClass = 'text-blue-400';
                        return (
                          <div key={idx} className={`${colorClass} leading-relaxed`}>{log}</div>
                        );
                      })}
                      <div ref={terminalEndRef} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: TIMING CONSTRAINTS (SDC)                                           */}
            {/* ========================================================================= */}
            {activeTab === 'constraints' && (
              <div className="space-y-6">
                <div className="rounded-xl border bg-white overflow-hidden shadow-sm" style={{ borderColor: 'var(--stone-ridge)' }}>
                  <div className="px-5 py-3 bg-gray-50 border-b">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-500" /> SDC Constraints File
                    </h3>
                  </div>
                  <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                    <pre className="text-amber-400 p-2">{question.sdc || '# No timing constraints file attached.'}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: INTERACTIVE WAVEFORM VIEWER (VCD CANVAS)                           */}
            {/* ========================================================================= */}
            {activeTab === 'waveform' && (
              <div className="space-y-6">
                <div className="rounded-xl border bg-white overflow-hidden shadow-sm" style={{ borderColor: 'var(--stone-ridge)' }}>
                  {/* Waveform Controls */}
                  <div className="px-5 py-4 bg-gray-50 border-b flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        <LineChart className="w-4 h-4 text-indigo-500" /> Interactive Waveform Viewer (VCD Parser)
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Click timelines to measure propagation delays (T<sub>pd</sub>) and explore metastability.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setZoomFactor(prev => Math.min(prev + 0.25, 2))}
                        className="p-1.5 border rounded bg-white hover:bg-gray-150 cursor-pointer text-gray-600 transition-colors"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setZoomFactor(prev => Math.max(prev - 0.25, 0.5))}
                        className="p-1.5 border rounded bg-white hover:bg-gray-150 cursor-pointer text-gray-600 transition-colors"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* SVG Waveform Rendering */}
                  <div className="p-4 overflow-x-auto bg-slate-950 text-slate-200">
                    
                    {/* Measurement Panel */}
                    <div className="flex items-center justify-between mb-4 px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 font-semibold mr-1">Timeline Cursors:</span> 
                        {hoveredTime !== null ? (
                          <span className="text-slate-300">Hover: {hoveredTime}ns</span>
                        ) : (
                          <span className="text-slate-500 italic">None</span>
                        )}
                        {selectedTime !== null && (
                          <span className="text-amber-400 ml-4 font-semibold">Selected: {selectedTime}ns</span>
                        )}
                      </div>
                      
                      {measurementPoint ? (
                        <div className="text-indigo-400 font-semibold">
                          Delta Margin: Δt = 12ns | T<sub>pd</sub> = 1.2ns (clk → register output)
                        </div>
                      ) : (
                        <div className="text-slate-500 italic">Click timeline to test delay margins</div>
                      )}
                    </div>

                    {/* The Waveform Canvas */}
                    <div className="relative overflow-x-auto">
                      <svg
                        height={200}
                        width={widthBase}
                        className="bg-slate-950 relative cursor-crosshair select-none"
                        onClick={handleWaveformClick}
                        onMouseMove={handleWaveformMouseMove}
                        onMouseLeave={() => setHoveredTime(null)}
                      >
                        {/* Vertical Gridlines & Timestamps */}
                        {Array.from({ length: 11 }).map((_, idx) => {
                          const nsVal = idx * 10;
                          const xPos = (nsVal / 100) * widthBase;
                          return (
                            <g key={idx}>
                              <line 
                                x1={xPos} 
                                y1={10} 
                                x2={xPos} 
                                y2={180} 
                                stroke="#1e293b" 
                                strokeWidth={1} 
                                strokeDasharray="2,2" 
                              />
                              <text 
                                x={xPos + 2} 
                                y={192} 
                                fill="#64748b" 
                                fontSize={9} 
                                fontFamily="monospace"
                              >
                                {nsVal}ns
                              </text>
                            </g>
                          );
                        })}

                        {/* SIGNAL 1: clk */}
                        <g transform={`translate(0, 20)`}>
                          <text x={10} y={15} fill="#94a3b8" fontSize={10} fontWeight="bold" fontFamily="monospace">clk</text>
                          {/* Toggling clock wave */}
                          <path
                            d={`M 80 15 
                               L ${80 + (widthBase - 80) * 0.1} 15 L ${80 + (widthBase - 80) * 0.1} 0 
                               L ${80 + (widthBase - 80) * 0.2} 0 L ${80 + (widthBase - 80) * 0.2} 15 
                               L ${80 + (widthBase - 80) * 0.3} 15 L ${80 + (widthBase - 80) * 0.3} 0
                               L ${80 + (widthBase - 80) * 0.4} 0 L ${80 + (widthBase - 80) * 0.4} 15
                               L ${80 + (widthBase - 80) * 0.5} 15 L ${80 + (widthBase - 80) * 0.5} 0
                               L ${80 + (widthBase - 80) * 0.6} 0 L ${80 + (widthBase - 80) * 0.6} 15
                               L ${80 + (widthBase - 80) * 0.7} 15 L ${80 + (widthBase - 80) * 0.7} 0
                               L ${80 + (widthBase - 80) * 0.8} 0 L ${80 + (widthBase - 80) * 0.8} 15
                               L ${80 + (widthBase - 80) * 0.9} 15 L ${80 + (widthBase - 80) * 0.9} 0
                               L ${widthBase} 0`}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth={1.5}
                          />
                        </g>

                        {/* SIGNAL 2: rst_n */}
                        <g transform={`translate(0, 60)`}>
                          <text x={10} y={15} fill="#94a3b8" fontSize={10} fontWeight="bold" fontFamily="monospace">rst_n</text>
                          {/* Reset signal transitions high at 30% */}
                          <path
                            d={`M 80 15 L ${80 + (widthBase - 80) * 0.25} 15 L ${80 + (widthBase - 80) * 0.25} 0 L ${widthBase} 0`}
                            fill="none"
                            stroke="#34d399"
                            strokeWidth={1.5}
                          />
                        </g>

                        {/* SIGNAL 3: state[1:0] (Bus hex representation) */}
                        <g transform={`translate(0, 100)`}>
                          <text x={10} y={15} fill="#94a3b8" fontSize={10} fontWeight="bold" fontFamily="monospace">state[1:0]</text>
                          
                          {/* IDLE state */}
                          <polygon 
                            points={`80,15 ${80 + (widthBase - 80) * 0.25},15 ${80 + (widthBase - 80) * 0.28},7.5 ${80 + (widthBase - 80) * 0.25},0 80,0`} 
                            fill="#1e293b" 
                            stroke="#94a3b8" 
                            strokeWidth={1}
                          />
                          <text x={85} y={11} fill="#e2e8f0" fontSize={8} fontFamily="monospace">IDLE</text>

                          {/* SETUP state */}
                          <polygon 
                            points={`${80 + (widthBase - 80) * 0.28},7.5 ${80 + (widthBase - 80) * 0.29},15 ${80 + (widthBase - 80) * 0.45},15 ${80 + (widthBase - 80) * 0.48},7.5 ${80 + (widthBase - 80) * 0.45},0 ${80 + (widthBase - 80) * 0.29},0`} 
                            fill="#1e293b" 
                            stroke="#94a3b8" 
                            strokeWidth={1}
                          />
                          <text x={80 + (widthBase - 80) * 0.32} y={11} fill="#e2e8f0" fontSize={8} fontFamily="monospace">SETUP</text>

                          {/* CRITICAL ANOMALOUS METASTABLE X-STATE (Highlighted red) */}
                          <polygon 
                            points={`${80 + (widthBase - 80) * 0.48},7.5 ${80 + (widthBase - 80) * 0.49},15 ${80 + (widthBase - 80) * 0.62},15 ${80 + (widthBase - 80) * 0.65},7.5 ${80 + (widthBase - 80) * 0.62},0 ${80 + (widthBase - 80) * 0.49},0`} 
                            fill="rgba(239, 68, 68, 0.25)" 
                            stroke="#ef4444" 
                            strokeWidth={1.5}
                            strokeDasharray="2,1"
                          />
                          <text x={80 + (widthBase - 80) * 0.53} y={11} fill="#fca5a5" fontSize={8} fontWeight="bold" fontFamily="monospace">METASTABLE X</text>

                          {/* RUN state */}
                          <polygon 
                            points={`${80 + (widthBase - 80) * 0.65},7.5 ${80 + (widthBase - 80) * 0.66},15 ${widthBase},15 ${widthBase},0 ${80 + (widthBase - 80) * 0.66},0`} 
                            fill="#1e293b" 
                            stroke="#94a3b8" 
                            strokeWidth={1}
                          />
                          <text x={80 + (widthBase - 80) * 0.75} y={11} fill="#e2e8f0" fontSize={8} fontFamily="monospace">RUN</text>
                        </g>

                        {/* SIGNAL 4: err_sig */}
                        <g transform={`translate(0, 140)`}>
                          <text x={10} y={15} fill="#94a3b8" fontSize={10} fontWeight="bold" fontFamily="monospace">err_sig</text>
                          {/* Transitions high during Metastable region */}
                          <path
                            d={`M 80 15 
                               L ${80 + (widthBase - 80) * 0.48} 15 
                               L ${80 + (widthBase - 80) * 0.48} 0 
                               L ${80 + (widthBase - 80) * 0.65} 0 
                               L ${80 + (widthBase - 80) * 0.65} 15 
                               L ${widthBase} 15`}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth={1.5}
                          />
                        </g>

                        {/* Interactive vertical hover indicator lines */}
                        {hoveredTime !== null && (
                          <line
                            x1={(hoveredTime / 100) * widthBase}
                            y1={0}
                            x2={(hoveredTime / 100) * widthBase}
                            y2={180}
                            stroke="#fbbf24"
                            strokeWidth={1}
                            opacity={0.6}
                          />
                        )}

                        {selectedTime !== null && (
                          <line
                            x1={(selectedTime / 100) * widthBase}
                            y1={0}
                            x2={(selectedTime / 100) * widthBase}
                            y2={180}
                            stroke="#fbbf24"
                            strokeWidth={1.5}
                          />
                        )}

                        {/* Highlight metastable interval annotation */}
                        <rect
                          x={80 + (widthBase - 80) * 0.48}
                          y={0}
                          width={(widthBase - 80) * (0.65 - 0.48)}
                          height={180}
                          fill="rgba(239, 68, 68, 0.04)"
                          stroke="rgba(239, 68, 68, 0.15)"
                          strokeWidth={1}
                          strokeDasharray="4,4"
                          pointerEvents="none"
                        />
                      </svg>
                    </div>

                    {/* Metadata alert box */}
                    <div className="mt-3 p-3 rounded-lg bg-red-950/30 border border-red-900/60 flex items-start gap-2 text-red-200 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                      <div>
                        <strong>METASTABLE EXCURSION ALARM:</strong> At time **48ns - 65ns**, the `state[1:0]` bus exhibits an anomalous `X` value. A clock-domain crossing synchronization path is missing.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 5: TELEMETRY DATA SHEET                                               */}
            {/* ========================================================================= */}
            {activeTab === 'telemetry' && (
              <div className="space-y-6">
                <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4 font-ui" style={{ borderColor: 'var(--stone-ridge)' }}>
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--abyss-ink)', fontFamily: 'var(--font-display)' }}>
                      <Activity className="w-4 h-4 text-emerald-600" /> Design Telemetry Summary
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Automated PDK constraints mapping & cell area estimations.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 border rounded-lg bg-gray-50/50">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">LUT Utilization</span>
                      <p className="text-sm font-bold text-gray-700 font-mono mt-1">{question.telemetry?.lut || 'N/A'}</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-gray-50/50">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Flip-Flop Count</span>
                      <p className="text-sm font-bold text-gray-700 font-mono mt-1">{question.telemetry?.ff || 'N/A'}</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-gray-50/50">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Total Area</span>
                      <p className="text-sm font-bold text-gray-700 font-mono mt-1">{question.telemetry?.area || 'N/A'}</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-gray-50/50">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Estimated Power</span>
                      <p className="text-sm font-bold text-gray-700 font-mono mt-1">{question.telemetry?.power || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-100" />

                  {/* Flow Details */}
                  <div className="text-xs text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Toolchain Engine:</span>
                      <span className="font-mono">{question.toolVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Process Development Kit (PDK):</span>
                      <span className="font-mono">{question.node}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Hardware Description Language:</span>
                      <span className="font-mono">{question.language}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 6: DISCUSSIONS & ANSWERS BOARD                                        */}
            {/* ========================================================================= */}
            {activeTab === 'discussion' && (
              <div className="space-y-6">
                
                {/* Answers list */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Responses ({question.answers.length})
                  </h3>
                  
                  {question.answers.length > 0 ? (
                    <div className="space-y-4">
                      {question.answers.map((ans, i) => (
                        <div 
                          key={i} 
                          className="rounded-xl border p-5 bg-white relative transition-all shadow-sm" 
                          style={{ 
                            borderColor: ans.isSolution ? 'var(--meridian-gold)' : 'var(--stone-ridge)',
                            borderWidth: ans.isSolution ? '1.5px' : '1px'
                          }}
                        >
                          {ans.isVerified && (
                            <span className="absolute top-3 right-3 bg-emerald-600 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs border border-emerald-500">
                              <CheckCircle className="w-3.5 h-3.5" /> Verified Fix
                            </span>
                          )}
                          
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold" style={{ background: 'var(--abyss-ink)' }}>
                              {ans.author[0]}
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-semibold text-gray-700">{ans.author}</span>
                                <span className="text-gray-400">{ans.time}</span>
                              </div>
                              <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap font-ui">
                                {ans.body}
                              </p>
                              
                              <div className="flex items-center gap-2 text-xs pt-1">
                                <button className="flex items-center gap-1.5 text-gray-400 hover:text-amber-500 transition-colors cursor-pointer">
                                  <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({ans.votes})
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-white border rounded-xl" style={{ borderColor: 'var(--stone-ridge)' }}>
                      <p className="text-xs text-gray-400">No responses posted yet. Be the first to answer!</p>
                    </div>
                  )}
                </div>

                {/* Add Answer Form */}
                <div className="rounded-xl border p-5 bg-white space-y-4 shadow-sm" style={{ borderColor: 'var(--stone-ridge)' }}>
                  <h4 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--abyss-ink)', fontFamily: 'var(--font-display)' }}>
                    <MessageSquare className="w-4 h-4 text-[#D4AF37]" /> Write Your Recommendation
                  </h4>
                  
                  <form onSubmit={handlePostAnswer} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600">Your Nickname</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. LayoutGuru"
                        value={newAuthor}
                        onChange={e => setNewAuthor(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-amber-500 bg-gray-50/50"
                        style={{ borderColor: 'var(--stone-ridge)' }}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-600">Your Answer</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Explain your diagnostic advice, steps, or code fixes..."
                        value={newAnswerText}
                        onChange={e => setNewAnswerText(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-xs outline-none focus:ring-1 focus:ring-amber-500 font-ui"
                        style={{ borderColor: 'var(--stone-ridge)' }}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isSolution"
                        checked={isSolutionInput}
                        onChange={e => setIsSolutionInput(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-500"
                      />
                      <label htmlFor="isSolution" className="text-xs text-gray-600 cursor-pointer select-none">
                        Mark this as the accepted solution (closes the question thread)
                      </label>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white transition-all hover:scale-102 cursor-pointer shadow-sm"
                        style={{ background: 'var(--abyss-ink)' }}
                      >
                        <Send className="w-3.5 h-3.5" /> Post Answer
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-5">
              
              {/* Run Atlas CTA */}
              <div className="rounded-xl border p-5 text-center shadow-sm" style={{ background: 'var(--abyss-ink)', border: '1px solid var(--abyss-ink)' }}>
                <div className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center animate-pulse" style={{ background: 'var(--meridian-gold)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--abyss-ink)' }}>A</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Have a similar issue?</h4>
                <p className="text-xs mb-4" style={{ color: 'rgba(243,242,237,0.6)' }}>Run Atlas analysis on your specific logs and constraints.</p>
                <Link to="/atlas" className="block w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-all hover:scale-102 shadow" style={{ background: 'var(--meridian-gold)', color: 'var(--abyss-ink)' }}>
                  Run Atlas Analysis
                </Link>
              </div>

              {/* Strict Taxonomy metadata box */}
              <div className="rounded-xl border p-5 bg-white shadow-sm" style={{ borderColor: 'var(--stone-ridge)' }}>
                <h4 className="text-xs font-semibold tracking-widest uppercase mb-4 text-gray-400">
                  Strict PDK Taxonomy
                </h4>
                <div className="space-y-3 font-mono text-[11px] text-gray-600">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="font-semibold font-ui">1. Domain:</span>
                    <span>{question.domain}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="font-semibold font-ui">2. Language:</span>
                    <span>{question.language}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="font-semibold font-ui">3. Tool & Ver:</span>
                    <span>{question.toolVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold font-ui">4. Node:</span>
                    <span>{question.node}</span>
                  </div>
                </div>
              </div>

              {/* Related Questions */}
              <div className="rounded-xl border p-5 shadow-sm" style={{ border: '1px solid var(--stone-ridge)', background: '#FFFFFF' }}>
                <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#94A3B8' }}>Related Questions</h4>
                <div className="space-y-3">
                  {[
                    'CTS fails with "clock not found" in Innovus',
                    'Missing clock in synthesis output',
                    'Generated clock not recognized by CTS',
                    'Multiple clock domains in OpenROAD',
                  ].map((q, idx) => (
                    <Link key={idx} to="/community" className="flex items-start gap-2 group text-xs text-gray-600 hover:text-amber-500">
                      <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-gray-300 group-hover:text-amber-500" />
                      <span className="group-hover:underline leading-relaxed">{q}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
}
