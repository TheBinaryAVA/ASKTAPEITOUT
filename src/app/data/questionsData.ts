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

const seedQuestions: Question[] = [
  {
    id: 1,
    title: 'OpenROAD CTS failure: "No clock defined in design" after floorplanning',
    body: `I'm running the OpenROAD flow on a RISC-V core targeting Sky130. After floorplanning completes successfully, the CTS stage fails with:

[ERROR CTS-0008] No clock defined in design.

I've verified that synthesis completes without errors. The netlist looks correct. This happens consistently at the CTS stage. My SDC and RTL files are attached.`,
    domain: 'Physical Design',
    language: 'Tcl/SDC',
    toolVersion: 'OpenROAD v2.1',
    node: 'Sky130',
    tags: ['CTS', 'OpenROAD', 'Sky130', 'Clock', 'SDC'],
    views: 2847,
    votes: 42,
    author: 'V. Krishnamurthy',
    rep: 1240,
    date: 'Jun 8, 2026',
    solved: true,
    severity: 'Critical',
    sdc: `# constraints.sdc
set_units -time ns -resistance kOhm -capacitance pF -voltage V -current mA
set_max_fanout 20 [current_design]

# PROBLEM: Missing create_clock constraint!
# No clock source defined here

set_input_delay 0.5 -clock clk [all_inputs]
set_output_delay 0.5 -clock clk [all_outputs]
set_max_transition 0.25 [current_design]`,
    verilog: `module clk_divider (
    input  wire clk,
    input  wire rst_n,
    output reg  clk_out
);
    reg [3:0] counter;
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            counter <= 4'b0;
            clk_out <= 1'b0;
        end else begin
            if (counter == 4'd9) begin
                counter <= 4'b0;
                clk_out <= ~clk_out;
            end else begin
                counter <= counter + 1'b1;
            end
        end
    end
endmodule`,
    telemetry: {
      lut: '24 LUTs (1.2% utilization)',
      ff: '5 Flip-Flops',
      area: '143.52 um²',
      power: '12.48 uW'
    },
    answers: [
      {
        author: 'M. Patel',
        time: '2 days ago',
        body: 'Had this exact issue last week. The create_clock fix works. Make sure the port name in get_ports matches exactly — Sky130 is case-sensitive.',
        votes: 12,
        isSolution: true,
        isVerified: true
      },
      {
        author: 'T. Nakamura',
        time: '1 day ago',
        body: "Also worth checking: if you have multiple clocks, you'll need a create_clock for each one, plus create_generated_clock for any divided/multiplied clocks.",
        votes: 8,
        isSolution: false
      }
    ],
    atlasAnalysis: {
      failure: 'CTS-0008: No clock defined in design',
      confidence: 94,
      rootCause: "The SDC constraints file is missing a create_clock or create_generated_clock directive. Without an explicit clock definition, OpenROAD's CTS engine has no clock tree to build.",
      recommendation: 'Add a create_clock constraint to your SDC file before the CTS stage. The clock source net name must match the actual clock port in your netlist.',
      evidence: [
        'SDC file contains set_input_delay referencing "clk" but no create_clock defining it',
        'Error code CTS-0008 is exclusively triggered by missing clock definitions (seen 2,847 times)',
        'Synthesis log shows no SDC parsing errors — constraint file was read but clock was silently undefined'
      ],
      impact: 'CTS cannot proceed without a defined clock. No downstream timing analysis is possible.',
      seenCount: 2847,
      successRate: 96,
      fixCode: `# constraints.sdc — Fixed Version
set_units -time ns -resistance kOhm -capacitance pF -voltage V -current mA
set_max_fanout 20 [current_design]

# SOLUTION: Add create_clock constraint
# Replace 'clk' with your actual clock port name
# Replace 10.0 with your target clock period in nanoseconds
create_clock -name clk -period 10.0 [get_ports clk]

# Optional: define clock uncertainty
set_clock_uncertainty 0.1 [get_clocks clk]
set_clock_transition 0.15 [get_clocks clk]

set_input_delay 0.5 -clock clk [all_inputs]
set_output_delay 0.5 -clock clk [all_outputs]
set_max_transition 0.25 [current_design]`
    }
  },
  {
    id: 2,
    title: 'Hold timing violation slack of -0.23ns persists after repair_timing in GF180',
    body: `I'm using the OpenROAD-flow-scripts for GlobalFoundries 180nm. I ran repair_timing during placement and routing, but during the Signoff timing report I still get a negative slack of -0.23ns. 

Why is the hold repair not fixing this path? It seems to be routing-dependent as the pre-route timing looked fine.`,
    domain: 'Physical Design',
    language: 'Tcl/SDC',
    toolVersion: 'OpenROAD v2.1',
    node: 'GF180',
    tags: ['Timing', 'Hold', 'GF180', 'OpenROAD'],
    views: 1923,
    votes: 28,
    author: 'J. Doe',
    rep: 345,
    date: 'Jun 7, 2026',
    solved: true,
    severity: 'High',
    verilog: `module reg_pipeline (
    input  wire clk,
    input  wire rst_n,
    input  wire [7:0] d_in,
    output reg  [7:0] d_out
);
    reg [7:0] r1, r2;
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            r1    <= 8'b0;
            r2    <= 8'b0;
            d_out <= 8'b0;
        end else begin
            r1    <= d_in;
            r2    <= r1;  // Timing path violated (hold) due to skew
            d_out <= r2;
        end
    end
endmodule`,
    telemetry: {
      lut: '64 LUTs (2.4% utilization)',
      ff: '24 Flip-Flops',
      area: '512.18 um²',
      power: '45.12 uW'
    },
    answers: [
      {
        author: 'S. Alavi',
        time: '3 days ago',
        body: 'Check the clock skew between launch and capture registers. If your clock tree has too much latency variation in GF180, repair_timing might exhaust cell density bounds before inserting enough delay buffers.',
        votes: 15,
        isSolution: true,
        isVerified: true
      }
    ],
    atlasAnalysis: {
      failure: 'TIM-0023: Hold Violation Post-Repair',
      confidence: 88,
      rootCause: 'Hold violations persisting post-routing in GF180 are typically caused by placement congestion around capture registers preventing delay buffer insertion, or clock tree skew exceeding 0.3ns.',
      recommendation: 'Increase cell spacing bounds or reduce target placement density from 75% to 68%. This leaves enough whitespace for the router to insert hold-repair buffers directly adjacent to violated paths.',
      evidence: [
        'Congestion map shows >92% local density in the violated region',
        'Clock skew on the path is reported as 320ps, which exceeds the hold slack target'
      ],
      impact: 'Hold violations can cause silicon failure and cannot be corrected by frequency scaling.',
      seenCount: 1923,
      successRate: 88
    }
  },
  {
    id: 3,
    title: 'Routing congestion hotspot in upper-left corner of die area',
    body: `I am running OpenROAD detailed routing, but the router terminates with a congestion error. Looking at the KLayout congestion heat map, there is a massive congestion hotspot in the top-left area. 

I have a few macro blockages there but the standard cells seem to be clustering excessively around them.`,
    domain: 'Physical Design',
    language: 'Tcl/SDC',
    toolVersion: 'OpenROAD v2.1',
    node: 'Generic 28nm',
    tags: ['Routing', 'Congestion', 'Metal3', 'KLayout'],
    views: 1456,
    votes: 19,
    author: 'Elena Rostova',
    rep: 980,
    date: 'Jun 5, 2026',
    solved: false,
    severity: 'High',
    telemetry: {
      lut: '14,200 LUTs (74.2% utilization)',
      ff: '8,421 Flip-Flops',
      area: '24,320 um²',
      power: '124.5 uW'
    },
    answers: [
      {
        author: 'P. Dupont',
        time: '4 days ago',
        body: 'Try adding placement halos (keepouts) around your macro boundaries. Standard cells get squeezed into the corners if you do not define a halo width of at least 4-6 pitch sizes.',
        votes: 9,
        isSolution: false
      }
    ],
    atlasAnalysis: {
      failure: 'ROU-0041: Routing Congestion Hotspot',
      confidence: 76,
      rootCause: 'Missing macro placement halos. Without keepout margins, the global placer packs standard logic cells directly against macro boundaries, leaving insufficient tracks for local pin routing.',
      recommendation: 'Define standard cell halos around all hard macros. Add "set_macro_halo -width 5.0" in your floorplan script configuration.',
      evidence: [
        'Local cell density directly adjacent to Macro_1 exceeds 98%',
        'Most congestion is in horizontal metal3 tracks crossing standard cell rows near the macro border'
      ],
      impact: 'Detailed routing failure or high antenna violation counts.',
      seenCount: 1456,
      successRate: 79
    }
  },
  {
    id: 4,
    title: 'LVS mismatch: floating gate on PMOS device in Sky130 PDK',
    body: `My Magic LVS run completes with mismatch errors. The details show a floating gate on a PMOS device. The schematic shows this connected to VDD through a tie-high cell, but layout extraction suggests it is floating. 

I'm using Sky130A PDK. Any thoughts on how to fix this LVS error?`,
    domain: 'Verification',
    language: 'SPICE',
    toolVersion: 'Magic v8.3',
    node: 'Sky130',
    tags: ['LVS', 'Sky130', 'DRC', 'Magic'],
    views: 987,
    votes: 31,
    author: 'C. Vance',
    rep: 512,
    date: 'Jun 4, 2026',
    solved: true,
    severity: 'Critical',
    telemetry: {
      lut: '0 (Custom Layout Block)',
      ff: '0',
      area: '43.2 um²',
      power: '0.01 uW'
    },
    answers: [
      {
        author: 'K. Smith',
        time: '5 days ago',
        body: 'Sky130 requires explicit tap cells to tie down the bulk/nwell. If your cell row has no tap cells within the maximum spacing limit (60um), Magic will fail to extract connectivity for PMOS devices.',
        votes: 18,
        isSolution: true,
        isVerified: true
      }
    ],
    atlasAnalysis: {
      failure: 'LVS-0007: PMOS Floating Gate',
      confidence: 91,
      rootCause: 'Missing tap-cell insertions. Magic LVS cannot verify schematic connections because the PMOS bulk/nwell region is electrically isolated due to missing power/ground substrate taps.',
      recommendation: 'Ensure tap cell insertion step is enabled in your OpenLane/OpenROAD flow. Command: "tapcell -distance 14 -tapcell_master sky130_fd_sc_hd__tapvpwrvgnd_1"',
      evidence: [
        'Layout check shows tap cells are missing on row 12 and 14',
        'Substrate n-well has no physical connection to VDD'
      ],
      impact: 'LVS failure. Chip will experience latch-up or non-functional transistors.',
      seenCount: 987,
      successRate: 89
    }
  },
  {
    id: 5,
    title: 'Antenna violations on metal3 after global routing in TSMC 28nm design',
    body: `We are running signoff DRC check using Calibre on a TSMC 28nm block. We have 43 antenna violations reported on long metal3 routing lines. 

The signals are mostly reset lines and long bus wires. What are the best scripts/strategies to fix this? My Verilog is attached.`,
    domain: 'Verification',
    language: 'SystemVerilog',
    toolVersion: 'Calibre v2022.4',
    node: 'TSMC 28nm',
    tags: ['DRC', 'Antenna', 'TSMC', 'Routing'],
    views: 3201,
    votes: 35,
    author: 'Zhang Wei',
    rep: 2150,
    date: 'May 30, 2026',
    solved: true,
    severity: 'Medium',
    verilog: `module bus_driver (
    input  wire clk,
    input  wire rst_n,
    input  wire [31:0] data_in,
    output reg  [31:0] data_out
);
    // Long routing path causing antenna violations on metal3
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            data_out <= 32'b0;
        end else begin
            data_out <= data_in;
        end
    end
endmodule`,
    telemetry: {
      lut: '124 LUTs (1.5% utilization)',
      ff: '32 Flip-Flops',
      area: '1024 um²',
      power: '84 uW'
    },
    answers: [
      {
        author: 'D. Miller',
        time: '10 days ago',
        body: 'You can insert antenna diodes directly in the schematic or layout near the gate input. In OpenROAD, the "insert_diode" command will automatically scan routing and insert diodes where the wire-to-gate ratio is exceeded.',
        votes: 11,
        isSolution: true,
        isVerified: true
      }
    ],
    atlasAnalysis: {
      failure: 'DRC-0015: Antenna Violation',
      confidence: 95,
      rootCause: 'Gate damage hazard. The cumulative surface area of metal3 connected to a single gate terminal exceeds the PDK antenna ratio rule limit, presenting a risk of gate oxide breakdown during fabrication plasma etching.',
      recommendation: 'Enable antenna diode insertion during routing. In OpenROAD, use the "antenna_violator -diode_cell sky130_fd_sc_hd__diode_2" command to place protection diodes close to input gates.',
      evidence: [
        'Net "/cpu_core/reset" metal3 length exceeds 140um before connecting to gate input',
        'Calculated antenna ratio is 450:1, threshold is 250:1'
      ],
      impact: 'DRC signoff blocker. Risks permanent gate damage during chip manufacturing.',
      seenCount: 3201,
      successRate: 93
    }
  }
];



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
      // Self-healing database check: if Question 5 is missing or verilog is missing, force reseed.
      if (!parsed.some((q: any) => q.id === 5 && q.verilog) || !parsed.some((q: any) => q.id === 1 && q.verilog)) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setQuestions(seedQuestions);
        return seedQuestions;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to read from localStorage:', e);
  }

  // Set default if empty
  setQuestions(seedQuestions);
  return seedQuestions;
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
