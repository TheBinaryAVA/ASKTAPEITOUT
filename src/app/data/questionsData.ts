import { supabase } from '../lib/supabaseClient';

export interface Answer {
  author: string;
  time: string;
  body: string;
  votes: number;
  isSolution?: boolean;
  isVerified?: boolean; // Fork & Verify simulation status
}

export interface AtlasAnalysis {
  failure: string;
  confidence: number;
  rootCause: string;
  recommendation: string;
  evidence: string[];
  impact: string;
  seenCount: number;
  successRate: number;
  fixCode?: string;
}

export interface Telemetry {
  lut: string;
  ff: string;
  area: string;
  power: string;
}

export interface Question {
  userId?: string;
  id: string | number;
  title: string;
  body: string;
  tags: string[];

  // 4D Taxonomy Matrix
  domain: 'Digital Design' | 'Verification' | 'Physical Design' | 'Analog/RF';
  language: 'SystemVerilog' | 'VHDL' | 'Chisel' | 'Tcl/SDC' | 'SPICE';
  toolVersion: string; // e.g. OpenROAD v2.1, Calibre v2022.4, etc.
  node: 'Sky130' | 'GF180' | 'TSMC 5nm' | 'TSMC 28nm' | 'Generic 28nm';

  views: number;
  votes: number;
  answers: Answer[];
  author: string;
  userId?: string; // UUID of the user who created this question (for remote questions)
  rep: number;
  date: string;
  sdc?: string;
  verilog?: string;
  solved: boolean;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  atlasAnalysis?: AtlasAnalysis;
  telemetry?: Telemetry;
}

const seedQuestions: Question[] = [];

const LOCAL_STORAGE_KEY = 'ask_tapeitout_questions';
const REMOTE_QUESTION_PREFIX = 'supabase:';

interface RemoteQuestionPayload {
  title?: string;
  body?: string;
  tags?: string[];
  domain?: Question['domain'];
  language?: Question['language'];
  toolVersion?: string;
  node?: Question['node'];
  severity?: Question['severity'];
  verilog?: string;
}

interface RemoteQuestionRow {
  id: string;
  user_id: string | null;
  user_name: string | null;
  question: string;
  created_at: string;
}

function normalizeId(id: string | number): string {
  return String(id);
}

function isRemoteQuestionId(id: string | number): boolean {
  return normalizeId(id).startsWith(REMOTE_QUESTION_PREFIX);
}

function getRemoteQuestionId(id: string | number): string {
  return normalizeId(id).replace(REMOTE_QUESTION_PREFIX, '');
}

function coerceRemoteQuestionId(id: string): string | number {
  return /^\d+$/.test(id) ? Number(id) : id;
}

function buildRemoteQuestionId(id: string): string {
  return `${REMOTE_QUESTION_PREFIX}${id}`;
}

function inferTitleFromBody(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return 'Untitled question';
  const firstSentence = trimmed.split('\n')[0].trim();
  return firstSentence.length > 90 ? `${firstSentence.slice(0, 87)}...` : firstSentence;
}

function serializeRemoteQuestion(payload: RemoteQuestionPayload): string {
  return JSON.stringify(payload);
}

function parseRemoteQuestion(rawQuestion: string): RemoteQuestionPayload {
  try {
    const parsed = JSON.parse(rawQuestion);
    if (parsed && typeof parsed === 'object') {
      return parsed as RemoteQuestionPayload;
    }
  } catch {
    // Fall through to plain-text compatibility mode.
  }

  return {
    title: inferTitleFromBody(rawQuestion),
    body: rawQuestion,
  };
}

function mapRemoteRowToQuestion(row: RemoteQuestionRow): Question {
  const parsed = parseRemoteQuestion(row.question);
  const body = parsed.body?.trim() || '';
  const title = parsed.title?.trim() || inferTitleFromBody(body);

  return {
    id: buildRemoteQuestionId(row.id),
    title,
    body,
    tags: parsed.tags && parsed.tags.length > 0 ? parsed.tags : [parsed.domain || 'Digital Design', parsed.node || 'Sky130', parsed.language || 'SystemVerilog'],
    domain: parsed.domain || 'Digital Design',
    language: parsed.language || 'SystemVerilog',
    toolVersion: parsed.toolVersion || 'Generic',
    node: parsed.node || 'Sky130',
    views: 1,
    votes: 0,
    answers: [],
    author: row.user_name || 'Anonymous Engineer',
    userId: row.user_id || undefined,
    rep: 100,
    date: new Date(row.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    solved: false,
    severity: parsed.severity || 'Medium',
    verilog: parsed.verilog,
  };
}

function mergeQuestions(localQuestions: Question[], remoteQuestions: Question[]): Question[] {
  const byId = new Map<string, Question>();

  for (const question of localQuestions) {
    byId.set(normalizeId(question.id), question);
  }

  for (const question of remoteQuestions) {
    byId.set(normalizeId(question.id), question);
  }

  return Array.from(byId.values()).sort((a, b) => {
    const aRemote = isRemoteQuestionId(a.id);
    const bRemote = isRemoteQuestionId(b.id);

    if (aRemote && bRemote) {
      return normalizeId(b.id).localeCompare(normalizeId(a.id));
    }

    if (aRemote) return -1;
    if (bRemote) return 1;

    return Number(b.id) - Number(a.id);
  });
}

export function getQuestions(): Question[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Clean up any old synthetic/seed questions (IDs 1 to 5) from the cache
      const filtered = parsed.filter((q: any) => q.id !== 1 && q.id !== 2 && q.id !== 3 && q.id !== 4 && q.id !== 5);
      if (filtered.length !== parsed.length) {
        setQuestions(filtered);
        return filtered;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to read from localStorage:', e);
  }

  setQuestions([]);
  return [];
}

export function setQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(questions));
  } catch (e) {
    console.error('Failed to write to localStorage:', e);
  }
}

export function getQuestionById(id: string | number): Question | undefined {
  const list = getQuestions();
  return list.find(q => normalizeId(q.id) === normalizeId(id));
}

export function updateQuestionVotes(id: string | number, increment: number): Question[] {
  const list = getQuestions();
  const updated = list.map(q => {
    if (normalizeId(q.id) === normalizeId(id)) {
      return { ...q, votes: q.votes + increment };
    }
    return q;
  });
  setQuestions(updated);
  return updated;
}

export function addAnswerToQuestion(id: string | number, answer: Answer): Question[] {
  const list = getQuestions();
  const updated = list.map(q => {
    if (normalizeId(q.id) === normalizeId(id)) {
      return {
        ...q,
        answers: [...q.answers, answer],
        solved: answer.isSolution ? true : q.solved
      };
    }
    return q;
  });
  setQuestions(updated);
  return updated;
}

export function verifyAnswerInQuestion(questionId: string | number, answerIndex: number): Question[] {
  const list = getQuestions();
  const updated = list.map(q => {
    if (normalizeId(q.id) === normalizeId(questionId)) {
      const updatedAnswers = q.answers.map((ans, idx) => {
        if (idx === answerIndex) {
          return { ...ans, isVerified: true, isSolution: true };
        }
        return ans;
      });
      return { ...q, answers: updatedAnswers, solved: true };
    }
    return q;
  });
  setQuestions(updated);
  return updated;
}

export function addQuestion(
  title: string,
  body: string,
  author: string,
  userId: string,
  tags: string[],
  severity: 'Critical' | 'High' | 'Medium' | 'Low',
  domain: 'Digital Design' | 'Verification' | 'Physical Design' | 'Analog/RF',
  language: 'SystemVerilog' | 'VHDL' | 'Chisel' | 'Tcl/SDC' | 'SPICE',
  toolVersion: string,
  node: 'Sky130' | 'GF180' | 'TSMC 5nm' | 'TSMC 28nm' | 'Generic 28nm',
  verilogCode?: string
): Question {
  const list = getQuestions();
  const nextId = list.reduce((max, q) => {
    const qId = typeof q.id === 'number' ? q.id : 0;
    return qId > max ? qId : max;
  }, 0) + 1;

  // Generate a mock Atlas AI diagnosis based on title/tags
  const failureCode = 'ERR-0120';
  const rootCause = `Unresolved logic error in the ${domain} flow for the ${node} node using ${toolVersion}.`;
  const recommendation = 'We recommend analyzing the log output to find details. Use Yosys or OpenROAD to double check constraints.';

  const atlasAnalysis: AtlasAnalysis = {
    failure: `${failureCode}: ${title.substring(0, 40)}...`,
    confidence: 85,
    rootCause,
    recommendation,
    evidence: ['Parsed logs show termination status 1.', 'Constraints could not be fully mapped.'],
    impact: 'Synthesis blocker.',
    seenCount: 14,
    successRate: 81
  };

  const newQ: Question = {
    userId,
    id: nextId,
    title,
    body,
    tags: tags.length > 0 ? tags : [domain, node, language],
    domain,
    language,
    toolVersion,
    node,
    views: 1,
    votes: 0,
    answers: [],
    author,
    rep: 100,
    date: 'Just now',
    solved: false,
    severity,
    verilog: verilogCode || `module my_module (\n    input clk\n);\n    // Custom logic code\nendmodule`,
    telemetry: {
      lut: '12 LUTs (0.1%)',
      ff: '4 FFs',
      area: '82.4 um²',
      power: '5.2 uW'
    },
    atlasAnalysis
  };

  list.unshift(newQ);
  setQuestions(list);
  return newQ;
}

export async function fetchQuestions(): Promise<Question[]> {
  const localQuestions = getQuestions();
  const { data, error } = await supabase
    .from('questions')
    .select('id, user_id, user_name, question, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch Supabase questions:', error);
    return localQuestions;
  }

  const remoteQuestions = (data || []).map(mapRemoteRowToQuestion);
  const merged = mergeQuestions(localQuestions, remoteQuestions);
  setQuestions(merged);
  return merged;
}

export async function fetchQuestionById(id: string | number): Promise<Question | undefined> {
  const localMatch = getQuestionById(id);
  if (localMatch) {
    return localMatch;
  }

  if (!isRemoteQuestionId(id)) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('questions')
    .select('id, user_id, user_name, question, created_at')
    .eq('id', getRemoteQuestionId(id))
    .single();

  if (error) {
    console.error('Failed to fetch Supabase question:', error);
    return undefined;
  }

  const mapped = mapRemoteRowToQuestion(data as RemoteQuestionRow);
  const merged = mergeQuestions(getQuestions(), [mapped]);
  setQuestions(merged);
  return mapped;
}

export function deleteQuestion(
  questionId: number,
  currentUserId: string
): Question[] {
  const questions = getQuestions();

  const question = questions.find(q => q.id === questionId);

  if (!question) {
    return questions;
  }

  // Only owner can delete
  if (question.userId !== currentUserId) {
    return questions;
  }

  const updated = questions.filter(
    q => q.id !== questionId
  );

  setQuestions(updated);

  return updated;
}

export async function createRemoteQuestion(params: {
  userId: string;
  userName: string;
  title: string;
  body: string;
  tags: string[];
  severity: Question['severity'];
  domain: Question['domain'];
  language: Question['language'];
  toolVersion: string;
  node: Question['node'];
  verilogCode?: string;
}): Promise<Question> {
  const payload: RemoteQuestionPayload = {
    title: params.title,
    body: params.body,
    tags: params.tags,
    severity: params.severity,
    domain: params.domain,
    language: params.language,
    toolVersion: params.toolVersion,
    node: params.node,
    verilog: params.verilogCode,
  };

  const { data, error } = await supabase
    .from('questions')
    .insert({
      user_id: params.userId,
      user_name: params.userName,
      question: serializeRemoteQuestion(payload),
    })
    .select('id, user_id, user_name, question, created_at')
    .single();

  if (error) {
    throw error;
  }

  const mapped = mapRemoteRowToQuestion(data as RemoteQuestionRow);
  const merged = mergeQuestions(getQuestions(), [mapped]);
  setQuestions(merged);
  return mapped;
}

export function deleteLocalQuestion(id: string | number): Question[] {
  const list = getQuestions();
  const updated = list.filter(q => normalizeId(q.id) !== normalizeId(id));
  setQuestions(updated);
  return updated;
}

export async function deleteRemoteQuestion(
  id: string | number,
  currentUserId?: string
): Promise<void> {
  if (!isRemoteQuestionId(id)) {
    throw new Error('Can only delete remote questions');
  }

  const remoteId = coerceRemoteQuestionId(getRemoteQuestionId(id));
  let query = supabase
    .from('questions')
    .delete()
    .eq('id', remoteId);

  if (currentUserId) {
    query = query.eq('user_id', currentUserId);
  }

  const { data, error } = await query.select('id');

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('Delete was not permitted or the question no longer exists.');
  }

  // Also remove from local cache
  deleteLocalQuestion(id);
}
