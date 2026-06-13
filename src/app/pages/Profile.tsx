import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { User as UserIcon, Mail, Calendar, CheckCircle2, ChevronRight, ThumbsUp, MessageSquare, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getQuestions, Question } from '../data/questionsData';

export function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upvoted' | 'answered' | 'questions'>('upvoted');

  useEffect(() => {
    // Redirect to login if not authenticated once loading finishes
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--abyss-ink)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <span className="text-white/50 font-mono text-sm">Loading profile...</span>
        </div>
      </div>
    );
  }

  // Helper metadata
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const email = user.email || '';
  const avatarUrl = user.user_metadata?.avatar_url;
  const joinedDate = user.created_at 
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently';

  // Get initials for placeholder avatar
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Filter seed questions to simulate mock user activity
  const questionsList = getQuestions();
  const upvotedQuestions = questionsList.slice(0, 3);
  const answeredQuestions = questionsList.filter(q => q.solved).slice(0, 2);
  const userQuestions = questionsList.slice(4, 5);


  return (
    <div className="min-h-screen pt-24 pb-16 px-6 lg:px-8" style={{ background: 'var(--abyss-ink)', fontFamily: 'var(--font-ui)' }}>
      <div className="max-w-5xl mx-auto">
        
        {/* Profile Card Header */}
        <div 
          className="rounded-2xl p-8 border mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderColor: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Ambient Background Light */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Profile Picture */}
          <div className="shrink-0">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={fullName} 
                className="w-24 h-24 rounded-full border-2 border-[#D4AF37]/40 shadow-lg object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div 
                className="w-24 h-24 rounded-full border-2 border-[#D4AF37]/30 shadow-lg flex items-center justify-center font-mono text-2xl font-bold text-[#D4AF37]"
                style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(15, 23, 42, 0.45) 100%)'
                }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* User Information */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white font-display">{fullName}</h1>
              <p className="text-sm text-[#D4AF37]/80 font-mono mt-1">TapeItOut Member</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-white/40" />
                {email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-white/40" />
                Joined {joinedDate}
              </span>
            </div>

            {/* Simulated Reputation/Rank */}
            <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-mono font-semibold text-white/80">
                120 Rep • Novice Designer
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Upvoted', count: upvotedQuestions.length, icon: ThumbsUp, color: '#3B82F6' },
            { label: 'Solved', count: answeredQuestions.length, icon: CheckCircle2, color: '#10B981' },
            { label: 'Asked', count: userQuestions.length, icon: MessageSquare, color: '#F59E0B' },
          ].map(stat => (
            <div 
              key={stat.label}
              className="rounded-xl p-5 border text-center transition-all hover:bg-white/5"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'rgba(255, 255, 255, 0.05)'
              }}
            >
              <div className="flex justify-center mb-2">
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <p className="text-xl md:text-2xl font-bold text-white font-mono">{stat.count}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/40 font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs Control */}
        <div className="border-b mb-6 flex gap-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {[
            { id: 'upvoted', label: 'Upvoted Questions', count: upvotedQuestions.length },
            { id: 'answered', label: 'Solved Problems', count: answeredQuestions.length },
            { id: 'questions', label: 'My Questions', count: userQuestions.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="pb-3 text-sm font-semibold transition-all relative cursor-pointer"
              style={{
                color: activeTab === tab.id ? 'var(--meridian-gold)' : 'rgba(255, 255, 255, 0.5)'
              }}
            >
              {tab.label}
              <span className="ml-1.5 text-xs font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/40">
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="space-y-4">
          {activeTab === 'upvoted' && (
            <QuestionList questions={upvotedQuestions} emptyMessage="No upvoted questions yet." />
          )}
          {activeTab === 'answered' && (
            <QuestionList questions={answeredQuestions} emptyMessage="No solved problems yet." />
          )}
          {activeTab === 'questions' && (
            <QuestionList questions={userQuestions} emptyMessage="You haven't asked any questions yet." />
          )}
        </div>

      </div>
    </div>
  );
}

// Subcomponent to list questions
function QuestionList({ questions, emptyMessage }: { questions: Question[]; emptyMessage: string }) {
  if (questions.length === 0) {
    return (
      <div 
        className="rounded-xl p-12 text-center border font-mono text-sm text-white/30"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          borderColor: 'rgba(255, 255, 255, 0.04)'
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map(q => (
        <Link 
          key={q.id}
          to={`/questions/${q.id}`}
          className="flex items-center justify-between p-5 rounded-xl border group hover:bg-white/5 transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/50 uppercase tracking-wider">
                {q.domain}
              </span>
              {q.solved && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" /> Solved
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-white/95 group-hover:text-[#D4AF37] transition-colors truncate">
              {q.title}
            </h3>
            <p className="text-xs text-white/40 mt-1 font-mono">
              Votes: {q.votes} • Views: {q.views}
            </p>
          </div>
          
          <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      ))}
    </div>
  );
}
