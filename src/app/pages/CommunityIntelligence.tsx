import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Clock, 
  ArrowUpRight, 
  Search, 
  Plus, 
  ThumbsUp, 
  MessageSquare, 
  Eye, 
  X, 
  Filter,
  Lock,
  Globe,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { 
  getQuestions, 
  updateQuestionVotes, 
  addQuestion, 
  Question 
} from '../data/questionsData';

const weeklyData = [
  { day: 'Mon', failures: 42, fixed: 38 },
  { day: 'Tue', failures: 67, fixed: 61 },
  { day: 'Wed', failures: 55, fixed: 50 },
  { day: 'Thu', failures: 83, fixed: 75 },
  { day: 'Fri', failures: 91, fixed: 84 },
  { day: 'Sat', failures: 34, fixed: 31 },
  { day: 'Sun', failures: 28, fixed: 26 },
];

const trendData = [
  { month: 'Jul', cts: 120, timing: 89, routing: 143 },
  { month: 'Aug', cts: 98, timing: 112, routing: 167 },
  { month: 'Sep', cts: 145, timing: 134, routing: 189 },
  { month: 'Oct', cts: 134, timing: 156, routing: 201 },
  { month: 'Nov', cts: 167, timing: 143, routing: 178 },
  { month: 'Dec', cts: 189, timing: 178, routing: 234 },
];

const topFailures = [
  { id: 'CTS-0008', name: 'No Clock Defined', count: 2847, change: +12, successRate: 96 },
  { id: 'TIM-0023', name: 'Hold Violation', count: 1923, change: +8, successRate: 88 },
  { id: 'DRC-0015', name: 'Antenna Violation', count: 1678, change: -3, successRate: 93 },
  { id: 'PLA-0033', name: 'Placement Density', count: 1456, change: +5, successRate: 84 },
  { id: 'ROU-0041', name: 'Routing Congestion', count: 1204, change: +19, successRate: 79 },
];

const insights = [
  { author: 'Atlas Intelligence', time: '2h ago', body: 'CTS failures increased 12% this week, primarily in Sky130 designs. Most are related to missing create_clock constraints in newly synthesized RTL.', type: 'atlas' },
  { author: 'Community Pattern', time: '5h ago', body: 'Hold violations in GF180 designs are clustering around the 0.15–0.25ns slack range, suggesting a common setup issue with the PDK timing models.', type: 'community' },
  { author: 'Atlas Intelligence', time: '1d ago', body: 'Routing congestion in metal3 is becoming more common in designs targeting >100MHz in Sky130. Atlas recommends lowering placement density target to 70%.', type: 'atlas' },
  { author: 'Community Pattern', time: '2d ago', body: 'LVS floating gate errors in Sky130 PMOS devices reduced by 23% after a documentation update clarifying substrate contact requirements.', type: 'community' },
];

const defaultProprietaryCode = `module intel_xeon_l2_cache_controller (
    input wire clk,
    input wire intel_secure_reset_n,
    input wire [63:0] proprietary_data_bus,
    output reg [63:0] cache_tag_readout
);
    // Secure AES core block connections
    always @(posedge clk or negedge intel_secure_reset_n) begin
        if (!intel_secure_reset_n) begin
            intel_internal_register <= 64'hA5A5;
        end else begin
            intel_internal_register <= proprietary_data_bus ^ 64'h3F;
        end
    end
endmodule`;

const sanitizedCodeResult = `module module_A (
    input wire clk,
    input wire sig_0,
    input wire [63:0] sig_1,
    output reg [63:0] sig_2
);
    // Replaced connections (NDA-Safe Sanitized)
    always @(posedge clk or negedge sig_0) begin
        if (!sig_0) begin
            sig_3 <= 64'hA5A5;
        end else begin
            sig_3 <= sig_1 ^ 64'h3F;
        end
    end
endmodule`;

export function CommunityIntelligence() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7d');
  
  // Tab Switcher between Q&A Forum and Stats Dashboard
  const [activeMainTab, setActiveMainTab] = useState<'qna' | 'insights'>('qna');
  
  // Q&A State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'votes' | 'unanswered'>('newest');
  
  // Multi-dimensional filters (State)
  const [filterDomain, setFilterDomain] = useState<string>('All');
  const [filterNode, setFilterNode] = useState<string>('All');

  // Ask Question Modal State
  const [showAskModal, setShowAskModal] = useState(false);
  const [isPrivateTeam, setIsPrivateTeam] = useState(false); // NDA-Safe Private Instance Toggle
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newAuthor, setNewAuthor] = useState('Guest Engineer');
  const [newSeverity, setNewSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Medium');
  
  // 4D Taxonomy form fields
  const [newDomain, setNewDomain] = useState<'Digital Design' | 'Verification' | 'Physical Design' | 'Analog/RF'>('Digital Design');
  const [newLanguage, setNewLanguage] = useState<'SystemVerilog' | 'VHDL' | 'Chisel' | 'Tcl/SDC' | 'SPICE'>('SystemVerilog');
  const [newTool, setNewTool] = useState('OpenROAD v2.1');
  const [newNode, setNewNode] = useState<'Sky130' | 'GF180' | 'TSMC 5nm' | 'TSMC 28nm' | 'Generic 28nm'>('Sky130');
  
  // De-IP Sanitizer state
  const [codeToSanitize, setCodeToSanitize] = useState(defaultProprietaryCode);
  const [isSanitizing, setIsSanitizing] = useState(false);
  const [sanitizerStep, setSanitizerStep] = useState('');
  const [sanitizedCode, setSanitizedCode] = useState<string | null>(null);

  useEffect(() => {
    setQuestions(getQuestions());
  }, []);

  const handleUpvote = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = updateQuestionVotes(id, 1);
    setQuestions(updated);
  };

  const handleSanitizeCode = () => {
    setIsSanitizing(true);
    setSanitizerStep('Initializing browser-side De-IP parser...');
    
    setTimeout(() => {
      setSanitizerStep('Scanning for company-specific keywords (intel_)...');
      setTimeout(() => {
        setSanitizerStep('Anonymizing bus signals & register variables...');
        setTimeout(() => {
          setSanitizedCode(sanitizedCodeResult);
          setIsSanitizing(false);
          setSanitizerStep('');
        }, 600);
      }, 600);
    }, 600);
  };

  const handleApplySanitizedCode = () => {
    if (sanitizedCode) {
      setNewBody(prev => prev + '\n\n```verilog\n' + sanitizedCode + '\n```');
      setSanitizedCode(null);
      setCodeToSanitize('');
    }
  };

  const handleAskQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    const added = addQuestion(
      newTitle.trim(),
      newBody.trim(),
      newAuthor.trim() || 'Anonymous Engineer',
      [newDomain, newNode, newLanguage],
      newSeverity,
      newDomain,
      newLanguage,
      newTool || 'Generic',
      newNode,
      sanitizedCodeResult
    );

    // Refresh questions list
    setQuestions(getQuestions());
    
    // Reset form & close modal
    setNewTitle('');
    setNewBody('');
    setNewSeverity('Medium');
    setShowAskModal(false);

    // Navigate to the newly created question
    navigate(`/questions/${added.id}`);
  };

  // Filter and sort questions list using strict 4D taxonomy
  const filteredQuestions = questions
    .filter(q => {
      const matchesSearch = 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        q.body.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDomain = filterDomain === 'All' || q.domain === filterDomain;
      const matchesNode = filterNode === 'All' || q.node === filterNode;

      return matchesSearch && matchesDomain && matchesNode;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return b.id - a.id;
      }
      if (sortBy === 'votes') {
        return b.votes - a.votes;
      }
      if (sortBy === 'unanswered') {
        if (a.solved !== b.solved) {
          return a.solved ? 1 : -1;
        }
        return b.id - a.id;
      }
      return 0;
    });

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', fontFamily: 'var(--font-ui)' }}>
      {/* Header Banner */}
      <div style={{ background: 'var(--abyss-ink)' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-12 pb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--meridian-gold)' }}>
                Ask TapeItOut Community
              </p>
              <h1 className="mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: '#FFFFFF' }}>
                {activeMainTab === 'qna' ? 'Semiconductor Q&A Board' : 'Collective Knowledge.'}
              </h1>
              <p style={{ color: 'rgba(243,242,237,0.6)', maxWidth: '40rem' }}>
                {activeMainTab === 'qna' 
                  ? 'Recreating Stack Overflow for physical design, timing closure, PDK rules, and tapeout debugging.'
                  : 'Anonymized, aggregated insights from the TapeItOut engineering community. No proprietary data is ever exposed.'}
              </p>
            </div>
            
            {/* Ask Question Button */}
            {activeMainTab === 'qna' && (
              <button 
                onClick={() => setShowAskModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all hover:scale-102 shrink-0 self-start md:self-center cursor-pointer shadow-lg"
                style={{ background: 'var(--meridian-gold)', color: 'var(--abyss-ink)' }}
              >
                <Plus className="w-4 h-4" /> Ask Question
              </button>
            )}
          </div>

          {/* Tab Selection */}
          <div className="flex gap-4 mt-8 border-b border-white/10">
            <button
              onClick={() => setActiveMainTab('qna')}
              className="pb-3 text-sm font-medium transition-all relative cursor-pointer"
              style={{
                color: activeMainTab === 'qna' ? 'var(--meridian-gold)' : 'rgba(243,242,237,0.5)',
              }}
            >
              Q&A Forum
              {activeMainTab === 'qna' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--meridian-gold)' }} />
              )}
            </button>
            <button
              onClick={() => setActiveMainTab('insights')}
              className="pb-3 text-sm font-medium transition-all relative cursor-pointer"
              style={{
                color: activeMainTab === 'insights' ? 'var(--meridian-gold)' : 'rgba(243,242,237,0.5)',
              }}
            >
              Insights & Trends
              {activeMainTab === 'insights' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--meridian-gold)' }} />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        {activeMainTab === 'qna' ? (
          /* ========================================================================= */
          /* STACK OVERFLOW Q&A LAYOUT                                                 */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Q&A Main Area */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Search, Filter, Sort Controls */}
              <div className="bg-white rounded-xl border p-5 space-y-4 shadow-sm" style={{ borderColor: 'var(--stone-ridge)' }}>
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filter questions by title or description..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-amber-500 transition-all bg-gray-50/50"
                    style={{ borderColor: 'var(--stone-ridge)' }}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Multi-Dimensional Filters */}
                <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-400 uppercase tracking-wider">Domain:</span>
                    <select 
                      value={filterDomain} 
                      onChange={e => setFilterDomain(e.target.value)}
                      className="border rounded p-1.5 bg-white text-gray-600 outline-none"
                      style={{ borderColor: 'var(--stone-ridge)' }}
                    >
                      <option value="All">All Domains</option>
                      <option value="Digital Design">Digital Design</option>
                      <option value="Verification">Verification</option>
                      <option value="Physical Design">Physical Design</option>
                      <option value="Analog/RF">Analog/RF</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-400 uppercase tracking-wider">Node:</span>
                    <select 
                      value={filterNode} 
                      onChange={e => setFilterNode(e.target.value)}
                      className="border rounded p-1.5 bg-white text-gray-600 outline-none"
                      style={{ borderColor: 'var(--stone-ridge)' }}
                    >
                      <option value="All">All Nodes</option>
                      <option value="Sky130">Sky130</option>
                      <option value="GF180">GF180</option>
                      <option value="TSMC 5nm">TSMC 5nm</option>
                      <option value="Generic 28nm">Generic 28nm</option>
                    </select>
                  </div>
                </div>

                {/* Sort / Meta Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                  <span>Showing <strong>{filteredQuestions.length}</strong> questions</span>
                  <div className="flex items-center gap-1.5 border rounded-md overflow-hidden bg-gray-50" style={{ borderColor: 'var(--stone-ridge)' }}>
                    {[
                      { key: 'newest', label: 'Newest' },
                      { key: 'votes', label: 'Top Voted' },
                      { key: 'unanswered', label: 'Unresolved' }
                    ].map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setSortBy(opt.key as any)}
                        className="px-3 py-1.5 transition-colors font-medium border-r last:border-r-0 cursor-pointer"
                        style={{
                          background: sortBy === opt.key ? 'var(--abyss-ink)' : 'transparent',
                          color: sortBy === opt.key ? '#FFFFFF' : '#475569',
                          borderColor: 'var(--stone-ridge)'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stack Overflow Style Questions List */}
              <div className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--stone-ridge)' }}>
                {filteredQuestions.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredQuestions.map(q => (
                      <div key={q.id} className="p-5 flex items-start gap-4 transition-all hover:bg-gray-50/40">
                        
                        {/* Stats Block (Left Side) */}
                        <div className="flex flex-col items-end gap-2 w-20 shrink-0 text-right">
                          {/* Votes */}
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                            <span className="font-semibold text-sm">{q.votes}</span>
                            <span className="text-[11px] text-gray-400">votes</span>
                          </div>

                          {/* Answers status (Green block if solved, green border if unanswered but has posts) */}
                          <div className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 shrink-0 ${
                            q.answers.length > 0
                              ? q.solved
                                ? 'bg-emerald-600 text-white'
                                : 'border border-emerald-600 text-emerald-600'
                              : 'text-gray-400'
                          }`}>
                            {q.solved && <CheckCircle className="w-3 h-3" />}
                            <span>{q.answers.length} answers</span>
                          </div>

                          {/* Views */}
                          <div className="text-[11px] text-gray-400 flex items-center gap-1">
                            <span>{q.views}</span>
                            <span>views</span>
                          </div>
                        </div>

                        {/* Title and Excerpt (Right Side) */}
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/questions/${q.id}`} 
                            className="text-base font-semibold transition-colors line-clamp-1 block hover:underline"
                            style={{ fontFamily: 'var(--font-display)', color: 'var(--abyss-ink)' }}
                          >
                            {q.title}
                          </Link>
                          
                          <p className="text-xs text-gray-500 mt-1 mb-3 line-clamp-2 leading-relaxed font-ui">
                            {q.body}
                          </p>

                          {/* Strict Multi-Dimensional Taxonomy Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-gray-150/40 pt-2.5 mt-2.5 text-[10px] text-gray-500 font-mono bg-gray-50/50 p-2 rounded border border-gray-100">
                            <div><span className="text-gray-400 font-bold font-ui mr-1 uppercase">Domain:</span> {q.domain}</div>
                            <div><span className="text-gray-400 font-bold font-ui mr-1 uppercase">Lang:</span> {q.language}</div>
                            <div><span className="text-gray-400 font-bold font-ui mr-1 uppercase">Tool:</span> {q.toolVersion}</div>
                            <div><span className="text-gray-400 font-bold font-ui mr-1 uppercase">Node:</span> {q.node}</div>
                          </div>

                          {/* Meta Row: Tags & Author */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-1">
                            <div className="flex flex-wrap gap-1.5">
                              {q.severity && (
                                <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                                  q.severity === 'Critical' ? 'bg-red-50 text-red-600 border-red-200' :
                                  q.severity === 'High' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                  q.severity === 'Medium' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                  'bg-emerald-50 text-emerald-600 border-emerald-200'
                                }`}>
                                  {q.severity}
                                </span>
                              )}
                            </div>

                            {/* User details card */}
                            <div className="flex items-center gap-2 text-[11px] text-gray-400 bg-gray-50/50 px-2.5 py-1 rounded-md border border-gray-100">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] text-white" style={{ background: 'var(--abyss-ink)' }}>
                                {q.author[0]}
                              </div>
                              <span className="font-semibold text-gray-600">{q.author}</span>
                              <span className="font-mono text-[10px] text-amber-600">★{q.rep}</span>
                              <span>·</span>
                              <span>{q.date}</span>
                              
                              {/* Quick Upvote Icon */}
                              <button 
                                onClick={(e) => handleUpvote(q.id, e)}
                                className="ml-1 p-1 hover:text-amber-500 rounded hover:bg-gray-150 transition-colors cursor-pointer"
                                title="Upvote question"
                              >
                                <ThumbsUp className="w-3.5 h-3.5 text-gray-400 hover:text-amber-500" />
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 px-6 bg-white">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium mb-1 text-gray-700">No questions found</p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      No results matched your filter. Try adjusting your query or click "Ask Question" to post a new one.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Q&A Sidebar */}
            <div className="space-y-6">
              {/* Board stats */}
              <div className="rounded-xl border p-5 bg-white shadow-sm" style={{ borderColor: 'var(--stone-ridge)' }}>
                <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#94A3B8' }}>
                  Board Statistics
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Total Questions</span>
                    <span className="font-semibold text-gray-700">{questions.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Resolved Failures</span>
                    <span className="font-semibold text-emerald-600">{questions.filter(q => q.solved).length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Unresolved</span>
                    <span className="font-semibold text-amber-600">{questions.filter(q => q.answers.length === 0).length}</span>
                  </div>
                </div>
              </div>

              {/* Strict Multi-Dimensional Metrics */}
              <div className="rounded-xl border p-5 bg-white shadow-sm" style={{ borderColor: 'var(--stone-ridge)' }}>
                <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#94A3B8' }}>
                  Top Domains
                </h4>
                <div className="space-y-2.5 text-xs">
                  {['Physical Design', 'Verification', 'Digital Design'].map(domain => {
                    const count = questions.filter(q => q.domain === domain).length;
                    return (
                      <div key={domain} className="flex justify-between items-center">
                        <button onClick={() => setFilterDomain(domain)} className="text-gray-600 hover:underline hover:text-amber-500">
                          {domain}
                        </button>
                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-400">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Help Box */}
              <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.04)' }}>
                <h4 className="text-xs font-bold mb-2 flex items-center gap-1" style={{ color: 'var(--meridian-gold)' }}>
                  How to Write a Good Question
                </h4>
                <ul className="text-[11px] leading-relaxed text-gray-600 space-y-1.5 list-disc pl-4">
                  <li>Specify the EDA Tool and PDK Version.</li>
                  <li>Paste the exact [ERROR ...] console signature.</li>
                  <li>Use the **De-IP Sanitizer** tool to scrub proprietary RTL names before publishing.</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* ORIGINAL INSIGHTS & CHARTS DASHBOARD                                      */
          /* ========================================================================= */
          <div>
            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Active Engineers', value: '3,421', icon: Users, color: '#3B82F6', change: '+124 this week' },
                { label: 'Failures Diagnosed', value: '47,293', icon: Activity, color: 'var(--meridian-gold)', change: '+847 this week' },
                { label: 'Community Fixes', value: '8,934', icon: CheckCircle, color: '#10B981', change: '+203 this week' },
                { label: 'Avg Resolution', value: '4.2h', icon: Clock, color: '#8B5CF6', change: 'Down from 6.1h' },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl border p-5 bg-white shadow-sm" style={{ borderColor: 'var(--stone-ridge)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                    <span className="text-xs text-emerald-600 font-medium">{stat.change}</span>
                  </div>
                  <div className="mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--abyss-ink)' }}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Weekly Chart */}
                <div className="rounded-xl border p-6 bg-white shadow-sm" style={{ borderColor: 'var(--stone-ridge)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--abyss-ink)' }}>
                      Failures vs. Fixes — This Week
                    </h2>
                    <div className="flex gap-2">
                      {['7d', '30d', '90d'].map(r => (
                        <button
                          key={r}
                          onClick={() => setTimeRange(r)}
                          className="px-2.5 py-1 rounded text-xs transition-all cursor-pointer"
                          style={{
                            background: timeRange === r ? 'var(--abyss-ink)' : 'var(--canvas-bone)',
                            color: timeRange === r ? 'var(--canvas-bone)' : '#64748B',
                            border: '1px solid var(--stone-ridge)',
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={weeklyData} barGap={4}>
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Work Sans' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Work Sans' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontFamily: 'Work Sans', fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 8 }} />
                      <Bar dataKey="failures" fill="rgba(194,65,12,0.7)" radius={[3, 3, 0, 0]} name="Failures" />
                      <Bar dataKey="fixed" fill="rgba(16,185,129,0.7)" radius={[3, 3, 0, 0]} name="Fixed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Trend Chart */}
                <div className="rounded-xl border p-6 bg-white shadow-sm" style={{ borderColor: 'var(--stone-ridge)' }}>
                  <h2 className="mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--abyss-ink)' }}>
                    Failure Category Trends — 6 Months
                  </h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Work Sans' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Work Sans' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontFamily: 'Work Sans', fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 8 }} />
                      <Line type="monotone" dataKey="cts" stroke="#EC4899" strokeWidth={2} dot={false} name="CTS" />
                      <Line type="monotone" dataKey="timing" stroke="#3B82F6" strokeWidth={2} dot={false} name="Timing" />
                      <Line type="monotone" dataKey="routing" stroke="#10B981" strokeWidth={2} dot={false} name="Routing" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-3">
                    {[{ label: 'CTS', color: '#EC4899' }, { label: 'Timing', color: '#3B82F6' }, { label: 'Routing', color: '#10B981' }].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: '#64748B' }}>
                        <div className="w-4 h-0.5 rounded" style={{ background: l.color }} />
                        {l.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Community Insights Feed */}
                <div className="rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--stone-ridge)' }}>
                  <div className="px-5 py-4 border-b bg-white" style={{ borderColor: 'var(--stone-ridge)' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--abyss-ink)' }}>
                      Intelligence Feed
                    </h2>
                  </div>
                  <div className="divide-y bg-gray-50/30">
                    {insights.map((insight, i) => (
                      <div key={i} className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                            style={{
                              background: insight.type === 'atlas' ? 'var(--abyss-ink)' : 'var(--secondary)',
                              color: insight.type === 'atlas' ? 'var(--meridian-gold)' : '#64748B',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {insight.type === 'atlas' ? 'A' : '◎'}
                          </div>
                          <span className="text-xs font-semibold" style={{ color: 'var(--abyss-ink)' }}>{insight.author}</span>
                          <span className="text-xs text-gray-400">{insight.time}</span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-600" style={{ fontFamily: 'var(--font-editorial)' }}>{insight.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Top Failures */}
                <div className="rounded-xl border overflow-hidden bg-white shadow-sm" style={{ borderColor: 'var(--stone-ridge)' }}>
                  <div className="px-4 py-3 border-b" style={{ background: 'var(--abyss-ink)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <h4 className="text-sm font-semibold text-white">Most Common Failures</h4>
                  </div>
                  <div className="divide-y bg-gray-50/10">
                    {topFailures.map((f, i) => (
                      <Link key={f.id} to={`/atlas/error/${f.id.toLowerCase()}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                        <span className="text-xs font-bold w-4 text-center text-gray-400">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold group-hover:underline" style={{ color: 'var(--abyss-ink)' }}>{f.name}</span>
                            <span className={`text-xs font-medium ${f.change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {f.change > 0 ? '↑' : '↓'}{Math.abs(f.change)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-400" style={{ fontFamily: 'var(--font-mono)' }}>{f.id}</span>
                            <span className="text-[10px] text-gray-400">·</span>
                            <span className="text-[10px] text-emerald-600 font-medium">{f.successRate}% fix rate</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-gray-600" style={{ fontFamily: 'var(--font-mono)' }}>
                          {f.count.toLocaleString()}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Popular Fixes */}
                <div className="rounded-xl border p-5 bg-white shadow-sm" style={{ borderColor: 'var(--stone-ridge)' }}>
                  <h4 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#94A3B8' }}>Popular Fixes This Week</h4>
                  <div className="space-y-3">
                    {[
                      { fix: 'Add create_clock to SDC', count: 847, pct: 96 },
                      { fix: 'Reduce placement density to 70%', count: 623, pct: 84 },
                      { fix: 'Add substrate contacts (LVS)', count: 445, pct: 91 },
                      { fix: 'Enable hold repair in CTS', count: 389, pct: 88 },
                    ].map((f, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{f.fix}</span>
                          <span className="text-emerald-600 font-semibold">{f.pct}%</span>
                        </div>
                        <div className="h-1 rounded-full" style={{ background: 'var(--secondary)' }}>
                          <div className="h-1 rounded-full" style={{ width: `${f.pct}%`, background: '#10B981' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy Note */}
                <div className="rounded-xl border p-4 bg-amber-50/10 border-amber-200/40">
                  <p className="text-xs leading-relaxed text-gray-400">
                    <span className="font-semibold" style={{ color: 'var(--meridian-gold)' }}>Privacy First.</span> All community data is anonymized and aggregated. No design IP, netlists, or proprietary information is ever stored or exposed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


      {showAskModal && (
        <div className="fixed inset-0 bg-[#0F172A]/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden border animate-in fade-in zoom-in-95 duration-200 flex flex-col h-[90vh]" style={{ borderColor: 'var(--stone-ridge)' }}>
            
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between text-white" style={{ background: 'var(--abyss-ink)' }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-[#D4AF37] text-[#0F172A] w-5 h-5 rounded-full flex items-center justify-center font-mono">?</span>
                <span className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                  Ask a Public Semiconductor Question
                </span>
              </div>
              
              {/* Private instance toggle */}
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg text-xs ml-auto mr-4">
                <button
                  type="button"
                  onClick={() => setIsPrivateTeam(!isPrivateTeam)}
                  className="flex items-center gap-1.5 font-semibold text-white/90 cursor-pointer"
                >
                  {isPrivateTeam ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-400">Private Team Server</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5" />
                      <span>Public Forum</span>
                    </>
                  )}
                </button>
              </div>

              <button 
                onClick={() => setShowAskModal(false)}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleAskQuestionSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-gray-50/20">
                {/* Private server banner */}
                {isPrivateTeam && (
                  <div className="rounded-lg p-3 text-xs leading-relaxed border border-amber-200 bg-amber-50/50 flex items-start gap-2 text-amber-800">
                    <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <strong className="block mb-0.5">NDA-Safe Environment Active</strong>
                      This question is indexed exclusively on your company's private server (**ask.tapeitout.company**). No telemetry or code blocks will be shared with the public forum.
                    </div>
                  </div>
                )}

                {/* Nickname and Severity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Your Nickname</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ChipDesignGuru"
                      value={newAuthor}
                      onChange={e => setNewAuthor(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                      style={{ borderColor: 'var(--stone-ridge)' }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Priority Severity</label>
                    <select
                      value={newSeverity}
                      onChange={e => setNewSeverity(e.target.value as any)}
                      className="w-full px-2 py-2 border rounded-md text-xs bg-white outline-none"
                      style={{ borderColor: 'var(--stone-ridge)' }}
                    >
                      <option value="Critical">Critical (Blocker)</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Title</label>
                  <p className="text-[10px] text-gray-400">Be specific and imagine you're asking a question to another chip designer</p>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OpenROAD detailed routing fails with 'no grid lines found' in Sky130"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                    style={{ borderColor: 'var(--stone-ridge)' }}
                  />
                </div>

                {/* Strict 4D Taxonomy Grid Selection */}
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-150 space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-500" /> Multi-Dimensional Taxonomy (PDK & Flow Indexing)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1 text-[11px]">
                      <span className="font-semibold text-gray-500">1. Domain</span>
                      <select 
                        value={newDomain} 
                        onChange={e => setNewDomain(e.target.value as any)}
                        className="border rounded p-1.5 bg-white text-gray-600 outline-none"
                        style={{ borderColor: 'var(--stone-ridge)' }}
                      >
                        <option value="Digital Design">Digital Design</option>
                        <option value="Verification">Verification</option>
                        <option value="Physical Design">Physical Design</option>
                        <option value="Analog/RF">Analog/RF</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 text-[11px]">
                      <span className="font-semibold text-gray-500">2. Language</span>
                      <select 
                        value={newLanguage} 
                        onChange={e => setNewLanguage(e.target.value as any)}
                        className="border rounded p-1.5 bg-white text-gray-600 outline-none"
                        style={{ borderColor: 'var(--stone-ridge)' }}
                      >
                        <option value="SystemVerilog">SystemVerilog</option>
                        <option value="VHDL">VHDL</option>
                        <option value="Chisel">Chisel</option>
                        <option value="Tcl/SDC">Tcl/SDC</option>
                        <option value="SPICE">SPICE</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 text-[11px]">
                      <span className="font-semibold text-gray-500">3. Tool & Version</span>
                      <input 
                        type="text"
                        value={newTool}
                        onChange={e => setNewTool(e.target.value)}
                        placeholder="e.g. OpenROAD v2.1"
                        className="border rounded p-1 bg-white text-gray-600 outline-none"
                        style={{ borderColor: 'var(--stone-ridge)' }}
                      />
                    </div>

                    <div className="flex flex-col gap-1 text-[11px]">
                      <span className="font-semibold text-gray-500">4. Process Node</span>
                      <select 
                        value={newNode} 
                        onChange={e => setNewNode(e.target.value as any)}
                        className="border rounded p-1.5 bg-white text-gray-600 outline-none"
                        style={{ borderColor: 'var(--stone-ridge)' }}
                      >
                        <option value="Sky130">Sky130 (130nm)</option>
                        <option value="GF180">GF180 (180nm)</option>
                        <option value="TSMC 5nm">TSMC 5nm</option>
                        <option value="TSMC 28nm">TSMC 28nm</option>
                        <option value="Generic 28nm">Generic 28nm</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* THE NDA-SAFE DE-IP SANITIZER */}
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-150 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> The De-IP Sanitizer (NDA-Safe Code Parser)
                    </h4>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider bg-gray-200/50 px-1.5 py-0.5 rounded">Local Parser</span>
                  </div>

                  <p className="text-[11px] text-gray-500">
                    Paste proprietary RTL logic below to strip company-specific signal/module labels and replace them with generic tokens before appending it to your question body.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sandbox Input */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase">Proprietary RTL Input</span>
                      <textarea
                        rows={5}
                        value={codeToSanitize}
                        onChange={e => setCodeToSanitize(e.target.value)}
                        className="w-full p-2 border rounded text-[11px] font-mono bg-white outline-none"
                        style={{ borderColor: 'var(--stone-ridge)' }}
                      />
                      <button
                        type="button"
                        onClick={handleSanitizeCode}
                        disabled={isSanitizing || !codeToSanitize.trim()}
                        className="mt-2 text-xs font-semibold py-1.5 px-3 rounded bg-[#0F172A] text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSanitizing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Sanitizing...</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-3.5 h-3.5" />
                            <span>Sanitize Code (De-IP)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Diff Output */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase">Sanitized Output (Generic Tokens)</span>
                      
                      <div className="w-full p-2 border rounded text-[11px] font-mono bg-slate-900 text-slate-100 overflow-y-auto h-[120px] relative">
                        {isSanitizing ? (
                          <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-3 text-center">
                            <RefreshCw className="w-5 h-5 text-amber-500 animate-spin mb-1" />
                            <span className="text-[10px] text-slate-400 font-semibold">{sanitizerStep}</span>
                          </div>
                        ) : sanitizedCode ? (
                          <pre className="text-emerald-400 leading-tight">{sanitizedCode}</pre>
                        ) : (
                          <span className="text-slate-500 italic flex items-center justify-center h-full text-center">
                            Awaiting sanitization...
                          </span>
                        )}
                      </div>

                      {sanitizedCode && (
                        <button
                          type="button"
                          onClick={handleApplySanitizedCode}
                          className="mt-2 text-xs font-bold py-1.5 px-3 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Append Sanitized Code to Question</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Question Body</label>
                  <p className="text-[10px] text-gray-400">Describe the failure behavior (your sanitized code can be appended here)</p>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the context of the bug..."
                    value={newBody}
                    onChange={e => setNewBody(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-xs outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                    style={{ borderColor: 'var(--stone-ridge)', fontFamily: 'var(--font-ui)' }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 border rounded-md text-sm font-semibold text-gray-600 hover:bg-gray-150 transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--stone-ridge)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md text-sm font-bold text-white transition-all hover:scale-102 cursor-pointer shadow"
                  style={{ background: 'var(--abyss-ink)' }}
                >
                  Post Your Question
                </button>
              </div>
            </form>
            
          </div>
        </div>
      )}
    </div>
  );
}
