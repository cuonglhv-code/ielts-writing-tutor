"use client";
import { useState, useEffect, useRef } from "react";

// ─── BAND DESCRIPTOR SYSTEM PROMPT ────────────────────────────────────────────
const EXAMINER_SYSTEM = `You are a Senior IELTS Examiner with 15+ years of experience, trained by the British Council and Cambridge Assessment English. You mark Writing tasks strictly according to the official IELTS band descriptors (public version, updated 2023). You are authoritative, precise, and constructive — like a professional examiner at an official marking centre.

=== OFFICIAL IELTS BAND DESCRIPTORS ===

TASK 2 – Four criteria, each worth 25%:

TASK RESPONSE (TR):
Band 9: Fully addresses all parts. Fully developed position with relevant, fully extended and well-supported ideas.
Band 8: Sufficiently addresses all parts. Well-developed response with relevant, extended and supported ideas.
Band 7: Addresses all parts. Clear position throughout. Extends and supports main ideas but may over-generalise or lack focus.
Band 6: Addresses all parts though some may be more fully covered. Relevant position but conclusions may be unclear/repetitive. Main ideas present but some inadequately developed.
Band 5: Addresses task only partially. Position expressed but development not always clear. Main ideas limited and not sufficiently developed; may have irrelevant detail.
Band 4: Responds minimally or tangentially. Position unclear. Main ideas difficult to identify, repetitive or unsupported.

COHERENCE & COHESION (CC):
Band 9: Cohesion attracts no attention. Skilfully manages paragraphing.
Band 8: Sequences information logically. Manages all aspects of cohesion well. Paragraphing sufficient and appropriate.
Band 7: Logically organises ideas, clear progression. Uses cohesive devices appropriately (some under/over-use). Clear central topic within each paragraph.
Band 6: Coherent arrangement with clear overall progression. Cohesive devices used effectively but may be faulty or mechanical within/between sentences. Paragraphing used but not always logically.
Band 5: Some organisation but lack of overall progression. Inadequate/inaccurate/over-use of cohesive devices. Repetitive due to lack of referencing. May not write in paragraphs.
Band 4: Ideas not arranged coherently, no clear progression. Basic cohesive devices, inaccurate or repetitive. May not write in paragraphs.

LEXICAL RESOURCE (LR):
Band 9: Wide range with very natural and sophisticated control. Rare minor errors only as slips.
Band 8: Wide range, fluent and flexible for precise meanings. Skilful use of uncommon lexis, occasional inaccuracies in collocation. Rare spelling errors.
Band 7: Sufficient range for flexibility and precision. Less common lexis with awareness of style/collocation. Occasional errors in word choice/spelling/word formation.
Band 6: Adequate range. Attempts less common vocabulary with some inaccuracy. Some spelling/word formation errors not impeding communication.
Band 5: Limited range, minimally adequate. Noticeable spelling/word formation errors causing some difficulty.
Band 4: Basic vocabulary, repetitive or inappropriate. Limited control of word formation/spelling; errors cause strain.

GRAMMATICAL RANGE & ACCURACY (GRA):
Band 9: Wide range of structures, full flexibility and accuracy. Rare minor errors only as slips.
Band 8: Wide range of structures. Majority of sentences error-free. Very occasional errors.
Band 7: Variety of complex structures. Frequent error-free sentences. Good control of grammar and punctuation with a few errors.
Band 6: Mix of simple and complex sentence forms. Some grammar and punctuation errors rarely reducing communication.
Band 5: Limited range of structures. Complex sentences less accurate than simple. Frequent grammatical errors; punctuation may be faulty.
Band 4: Very limited range, rare subordinate clauses. Errors predominate, punctuation often faulty.

TASK 1 – TASK ACHIEVEMENT (TA) instead of Task Response:
Band 9: Fully satisfies all requirements. Fully developed response.
Band 8: Covers all requirements sufficiently. Presents, highlights and illustrates key features clearly and appropriately.
Band 7: Covers requirements. Presents clear overview of main trends/differences/stages. Clearly presents and highlights key features but could be more fully extended.
Band 6: Addresses requirements. Presents overview with appropriately selected information. Adequately highlights key features but details may be irrelevant/inappropriate.
Band 5: Generally addresses task. Recounts detail mechanically with no clear overview. Inadequately covers key features; tendency to focus on details.
Band 4: Attempts to address task but does not cover all key features. May confuse key features with detail.

BAND SCORE ROUNDING RULES:
- Average the four criteria scores
- If the average ends in .25, round DOWN to the nearest .5
- If the average ends in .75, round UP to the nearest .5
- 6+6+7+7 = 6.5; 6+7+7+7 = 7.0; 5+6+6+7 = 6.0

IELTS LIZ & SIMON EXAMINER PRINCIPLES:
1. Word count matters: Task 1 < 150 words → automatic penalty (likely -0.5 band on TA); Task 2 < 250 words → penalty
2. Off-topic response: TR/TA capped at Band 5 maximum
3. Copied question rubric is discounted from word count
4. Memorised responses: flag and cap at Band 4
5. Task 2 carries double the weight of Task 1 in the overall Writing band score
6. Address ALL parts of the task question — a missing part caps TR at Band 5

=== YOUR MARKING PROTOCOL ===
When marking, you must:
1. Read the full essay carefully before scoring
2. Apply the descriptor HOLISTICALLY — find the band that best describes the overall performance on each criterion
3. Give half-band scores (e.g. 6.5) when performance falls between two bands
4. Be strict and calibrated — most candidates do NOT achieve Band 7+
5. NEVER inflate scores to encourage students

OUTPUT FORMAT — respond ONLY with this exact JSON (no markdown, no preamble):
{
  "taskType": "Task 1" or "Task 2",
  "wordCount": number,
  "wordCountNote": "string — comment on word count",
  "criteriaScores": {
    "TR": { "band": number, "label": "Task Response" or "Task Achievement", "feedback": "string — 3-4 sentences of specific, evidence-based feedback citing exact phrases from the essay" },
    "CC": { "band": number, "label": "Coherence & Cohesion", "feedback": "string — 3-4 sentences" },
    "LR": { "band": number, "label": "Lexical Resource", "feedback": "string — 3-4 sentences. Cite specific good/weak vocabulary from the essay" },
    "GRA": { "band": number, "label": "Grammatical Range & Accuracy", "feedback": "string — 3-4 sentences. Quote specific errors if present" }
  },
  "overallBand": number,
  "examinerSummary": "string — 4-5 sentence authoritative examiner summary: strengths, primary weaknesses, and single most impactful improvement",
  "priorityImprovements": [
    "string — specific, actionable improvement with example",
    "string",
    "string"
  ],
  "modelParagraph": "string — one improved paragraph rewritten by the examiner to demonstrate Band 7+ writing on the same point (50-80 words)",
  "comparativeLevel": "string — e.g. 'This response is consistent with a Band 6.0 candidate who has some flexibility in vocabulary but struggles with task focus.'"
}`;

// ─── PROMPTS DATA ──────────────────────────────────────────────────────────────
const T2_PROMPTS = [
  { id:"t2_1", type:"Opinion", text:"Some people believe that the best way to improve public health is by increasing the number of sports facilities. Others, however, think that this would have little effect on public health and that other measures are required. Discuss both views and give your own opinion." },
  { id:"t2_2", type:"Problem/Solution", text:"In many cities, the amount of traffic is increasing, causing problems of pollution and gridlock. What are the causes of this problem? What measures could be taken to reduce it?" },
  { id:"t2_3", type:"Two-Part Question", text:"Many people believe that social media has had a profoundly negative effect on individuals and society. To what extent do you agree or disagree? What changes do you think social media companies should make?" },
  { id:"t2_4", type:"Advantages/Disadvantages", text:"In many countries, more and more people are choosing to work from home rather than commute to an office. What are the advantages and disadvantages of this trend?" },
  { id:"t2_5", type:"Direct Question", text:"In some countries, young people are encouraged to work or travel for a year between finishing high school and starting university studies. Discuss the advantages and disadvantages for young people who decide to do this." },
];

const T1_PROMPTS = [
  { id:"t1_1", type:"Bar Chart", text:"The bar chart below shows the percentage of students achieving a band score of 7 or above in each IELTS section (Reading, Listening, Writing, Speaking) at three language schools in Ho Chi Minh City in 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\n[Chart data: Jaxtina: R=48%, L=52%, W=31%, S=38% | British Council: R=55%, L=60%, W=40%, S=42% | IDP: R=42%, L=45%, W=28%, S=35%]" },
  { id:"t1_2", type:"Line Graph", text:"The graph below shows changes in the number of students enrolled in English language courses in Vietnam between 2015 and 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\n[Data: 2015: 180,000 | 2017: 220,000 | 2019: 310,000 | 2021: 280,000 (COVID dip) | 2022: 340,000 | 2024: 520,000]" },
  { id:"t1_3", type:"Pie Chart", text:"The two pie charts below show how students at a language school spent their self-study time in 2010 and 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\n[2010: Grammar: 35%, Vocabulary: 25%, Reading: 20%, Listening: 15%, Speaking practice: 5%] [2024: Online apps: 30%, Speaking practice: 22%, Listening: 20%, Grammar: 15%, Reading: 8%, Vocabulary: 5%]" },
];

const WRITING_TIPS = [
  { source: "IELTSLiz", title: "Task 2 – Essay Structure", tip: "Introduction (2 sentences: paraphrase + thesis) → Body 1 (topic sentence + explain + example) → Body 2 → Conclusion. Never copy the question." },
  { source: "IELTSLiz", title: "Task Achievement – Most Common Mistake", tip: "Failing to address ALL parts of the question. A 'discuss both views' essay MUST have both views AND your opinion. Missing any part caps your TR at Band 5." },
  { source: "IELTS Simon", title: "Vocabulary – Simon's Method", tip: "Collocations beat single word synonyms. Instead of 'good' → try 'beneficial', 'advantageous', 'conducive to'. Learn verbs + nouns together: 'tackle the issue', 'alleviate pressure', 'foster development'." },
  { source: "IELTS Simon", title: "Coherence – Paragraph Structure", tip: "Each body paragraph = 1 main idea only. Start with a clear topic sentence. Use discourse markers sparingly: Furthermore, However, In contrast. Overuse of 'Additionally' and 'Moreover' will lower your CC score." },
  { source: "IELTSLiz", title: "Task 1 – Overview is Essential", tip: "The overview is the most important paragraph in Task 1. Write it in the introduction or as a separate paragraph. Missing an overview almost always results in Band 5 for Task Achievement." },
  { source: "IELTS Simon", title: "Grammar – Range vs Accuracy", tip: "Do not sacrifice accuracy for complexity. A Band 7 essay with some complex sentences and few errors beats a Band 5 essay with many complex sentences and many errors." },
  { source: "IELTSLiz", title: "Band 7 Checklist", tip: "✓ All parts of task addressed ✓ Clear overview (T1) or clear opinion (T2) ✓ Ideas extended with examples ✓ Paragraphs with clear central topic ✓ Mix of simple + complex sentences ✓ Some less common vocabulary used accurately ✓ Min 150/250 words" },
  { source: "IELTS Simon", title: "Word Count Warning", tip: "Do NOT write more than 300 words for Task 2. Quality over quantity. Examiners are not impressed by length — they look for ideas, coherence and language accuracy." },
];

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const countWords = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const bandColor = (b) => b >= 7 ? "text-teal-600" : b >= 6 ? "text-indigo-600" : b >= 5 ? "text-amber-600" : "text-red-600";
const bandBg = (b) => b >= 7 ? "bg-teal-50 border-teal-200" : b >= 6 ? "bg-indigo-50 border-indigo-200" : b >= 5 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
const bandLabel = (b) => b >= 8 ? "Expert" : b >= 7 ? "Good User" : b >= 6 ? "Competent" : b >= 5 ? "Modest" : b >= 4 ? "Limited" : "Extremely Limited";

function Timer({ secs, running, onEnd }) {
  const [t, setT] = useState(secs);
  const ref = useRef();
  useEffect(() => {
    if (!running) { clearInterval(ref.current); return; }
    ref.current = setInterval(() => setT(p => { if (p <= 1) { clearInterval(ref.current); onEnd(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(ref.current);
  }, [running]);
  const m = Math.floor(t / 60), s = t % 60;
  const pct = (t / secs) * 100;
  const urgent = t < 300;
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="13" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          <circle cx="16" cy="16" r="13" fill="none" stroke={urgent ? "#ef4444" : "#0d9488"} strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 13}`} strokeDashoffset={`${2 * Math.PI * 13 * (1 - pct / 100)}`}
            strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
      </div>
      <span className={`font-mono text-sm font-bold ${urgent ? "text-red-600 animate-pulse" : "text-slate-600"}`}>
        {String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}
      </span>
    </div>
  );
}

function BandGauge({ band }) {
  const pct = ((band - 1) / 8) * 100;
  const color = band >= 7 ? "#0d9488" : band >= 6 ? "#6366f1" : band >= 5 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-32 h-16 overflow-hidden">
      <svg viewBox="0 0 120 60" className="w-full">
        <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
        <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${Math.PI * 50}`} strokeDashoffset={`${Math.PI * 50 * (1 - pct / 100)}`} />
        <text x="60" y="58" textAnchor="middle" fontSize="18" fontWeight="bold" fill={color}>{band}</text>
      </svg>
    </div>
  );
}

// ─── FEEDBACK DISPLAY ──────────────────────────────────────────────────────────
function FeedbackPanel({ feedback, essay }) {
  const [tab, setTab] = useState("overview");
  const f = feedback;
  const criteria = Object.entries(f.criteriaScores);

  return (
    <div className="space-y-5">
      {/* Overall Score Header */}
      <div className="bg-gradient-to-r from-teal-600 to-indigo-700 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-teal-200 text-xs font-semibold uppercase tracking-widest">Senior Examiner Assessment</p>
            <h2 className="text-2xl font-black mt-0.5">Overall Band: {f.overallBand}</h2>
            <p className="text-teal-100 text-sm">{bandLabel(f.overallBand)} · {f.taskType} · {f.wordCount} words</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 text-center">
            <p className="text-4xl font-black">{f.overallBand}</p>
            <p className="text-xs text-teal-100 mt-0.5">{bandLabel(f.overallBand)}</p>
          </div>
        </div>
        {f.wordCountNote && (
          <div className={`text-xs px-3 py-2 rounded-lg ${f.wordCount < 150 || (f.taskType==="Task 2" && f.wordCount < 250) ? "bg-red-400/30 text-red-100" : "bg-white/10 text-teal-100"}`}>
            📝 {f.wordCountNote}
          </div>
        )}
      </div>

      {/* 4 Criteria Cards */}
      <div className="grid grid-cols-2 gap-3">
        {criteria.map(([key, c]) => (
          <div key={key} className={`rounded-xl border p-3 ${bandBg(c.band)}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{key}</p>
              <span className={`text-xl font-black ${bandColor(c.band)}`}>{c.band}</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 mb-1">{c.label}</p>
            <div className="h-1.5 bg-white/60 rounded-full">
              <div className="h-1.5 rounded-full transition-all" style={{ width:`${((c.band-1)/8)*100}%`, background: c.band >= 7 ? "#0d9488" : c.band >= 6 ? "#6366f1" : c.band >= 5 ? "#f59e0b" : "#ef4444" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {[["overview","📋 Overview"],["criteria","🔍 Criteria"],["improve","🎯 Improve"],["model","✍️ Model"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab===k ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Examiner's Summary</p>
            <p className="text-sm text-slate-700 leading-relaxed">{f.examinerSummary}</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">Comparative Level</p>
            <p className="text-sm text-indigo-800">{f.comparativeLevel}</p>
          </div>
          {/* Band progression */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Band Score Breakdown</p>
            <div className="space-y-2">
              {criteria.map(([key, c]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-8 font-mono">{key}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-3 rounded-full transition-all" style={{ width:`${((c.band-1)/8)*100}%`, background: c.band >= 7 ? "#0d9488" : c.band >= 6 ? "#6366f1" : c.band >= 5 ? "#f59e0b" : "#ef4444" }} />
                  </div>
                  <span className={`text-sm font-bold w-8 text-right ${bandColor(c.band)}`}>{c.band}</span>
                  <span className="text-xs text-slate-400 w-20">{bandLabel(c.band)}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100 mt-2">
                <span className="text-xs font-bold text-slate-700 w-8">AVG</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-3 rounded-full bg-teal-600" style={{ width:`${((f.overallBand-1)/8)*100}%` }} />
                </div>
                <span className={`text-sm font-black w-8 text-right ${bandColor(f.overallBand)}`}>{f.overallBand}</span>
                <span className="text-xs font-semibold text-teal-700 w-20">{bandLabel(f.overallBand)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "criteria" && (
        <div className="space-y-3">
          {criteria.map(([key, c]) => (
            <div key={key} className={`rounded-xl border p-4 ${bandBg(c.band)}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{key}</span>
                  <p className="font-bold text-slate-800">{c.label}</p>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-black ${bandColor(c.band)}`}>{c.band}</p>
                  <p className="text-xs text-slate-500">{bandLabel(c.band)}</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{c.feedback}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "improve" && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-3">🎯 Priority Improvements (Examiner Recommendations)</p>
            <div className="space-y-3">
              {(f.priorityImprovements || []).map((tip, i) => (
                <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                  <p className="text-sm text-slate-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "model" && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Examiner's Model Paragraph (Band 7+ Level)</p>
            <p className="text-xs text-slate-400 mb-3">The examiner has rewritten one paragraph from your essay to demonstrate Band 7+ writing quality on the same argument.</p>
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
              <p className="text-sm text-slate-700 leading-relaxed italic">{f.modelParagraph}</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-700 uppercase mb-2">⚠️ Examiner Note</p>
            <p className="text-xs text-amber-800">The model paragraph is a guide to demonstrate language quality. In a real exam, your ideas and examples should be your own. Focus on the structural and lexical techniques shown.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TIPS SIDEBAR ──────────────────────────────────────────────────────────────
function TipsSidebar({ taskType }) {
  const tips = WRITING_TIPS.filter((_, i) => taskType === "task1" ? [0,2,3,4,5,6].includes(i) : [0,1,2,3,5,6,7].includes(i));
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">📚 Examiner Tips</p>
      {tips.map((t, i) => (
        <div key={i} className={`rounded-xl border cursor-pointer transition-all ${open===i ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-white hover:border-teal-200"}`}
          onClick={() => setOpen(open===i ? null : i)}>
          <div className="px-3 py-2.5 flex items-start gap-2">
            <span className={`text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${t.source==="IELTSLiz" ? "bg-rose-100 text-rose-600" : "bg-indigo-100 text-indigo-600"}`}>{t.source}</span>
            <p className="text-xs font-semibold text-slate-700">{t.title}</p>
          </div>
          {open===i && <div className="px-3 pb-3 text-xs text-slate-600 leading-relaxed">{t.tip}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [taskType, setTaskType] = useState("task2");
  const [promptId, setPromptId] = useState("t2_1");
  const [essay, setEssay] = useState("");
  const [timerRunning, setTimerRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const prompts = taskType === "task2" ? T2_PROMPTS : T1_PROMPTS;
  const currentPrompt = useCustom ? { id:"custom", type:"Custom", text: customPrompt } : prompts.find(p => p.id === promptId) || prompts[0];
  const wordCount = countWords(essay);
  const minWords = taskType === "task1" ? 150 : 250;
  const recWords = taskType === "task1" ? "150–190" : "250–300";
  const timerSecs = taskType === "task1" ? 1200 : 2400;

  const generateAIPrompt = async () => {
    setAiGenerating(true);
    const topics = ["climate change","technology in education","globalisation","healthcare","urban development","immigration","social media","crime and punishment","gender equality","ageing population"];
    const topic = topics[Math.floor(Math.random()*topics.length)];
    const type = taskType === "task2"
      ? ["Opinion (To what extent do you agree?)", "Discuss both views and give your opinion", "Problem and solution", "Advantages and disadvantages", "Two direct questions"][Math.floor(Math.random()*5)]
      : ["Bar chart", "Line graph", "Pie chart", "Table", "Process diagram"][Math.floor(Math.random()*5)];
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 400,
          system: "You are an IELTS test writer. Generate an authentic IELTS writing question. Respond with ONLY the question text, no preamble.",
          messages: [{ role: "user", content: `Generate an authentic IELTS Academic Writing ${taskType === "task2" ? "Task 2" : "Task 1"} question.\nType: ${type}\nTopic: ${topic}\n${taskType === "task1" ? "Include brief chart/graph data in square brackets." : ""}\nWrite exactly as it would appear on an IELTS exam paper.` }]
        })
      });
      const data = await res.json();
      setCustomPrompt(data.content?.[0]?.text || "");
      setUseCustom(true);
    } catch { setCustomPrompt("Error generating prompt. Please try again."); setUseCustom(true); }
    setAiGenerating(false);
  };

  const submitEssay = async () => {
    if (wordCount < 20) { setError("Please write at least 20 words before submitting."); return; }
    setLoading(true); setError(""); setFeedback(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 2000,
          system: EXAMINER_SYSTEM,
          messages: [{ role:"user", content:`IELTS ${taskType === "task2" ? "Writing Task 2" : "Writing Task 1"} Question:\n${currentPrompt.text}\n\nStudent's Essay (${wordCount} words):\n${essay}\n\nMark this essay strictly according to the official IELTS band descriptors. Return ONLY the JSON object.` }]
        })
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "{}";
      const cleaned = raw.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(cleaned);
      setFeedback(parsed); setSubmitted(true);
    } catch(e) { setError(`Marking error: ${e.message}. Please try again.`); }
    setLoading(false);
  };

  const reset = () => { setEssay(""); setFeedback(null); setSubmitted(false); setTimerRunning(false); setError(""); };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">J</span>
          </div>
          <div>
            <h1 className="font-black text-slate-800 text-sm">Jaxtina IELTS Writing</h1>
            <p className="text-xs text-slate-400">Senior AI Examiner • Official Band Descriptors</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {timerRunning && <Timer secs={timerSecs} running={timerRunning} onEnd={() => { setTimerRunning(false); submitEssay(); }} />}
          {!timerRunning && !submitted && (
            <button onClick={() => setTimerRunning(true)} className="text-xs border border-teal-300 text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors">
              ▶ Start Timer ({taskType === "task1" ? "20" : "40"} min)
            </button>
          )}
          {submitted && <button onClick={reset} className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">↺ New Essay</button>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Task Type Selector */}
        {!submitted && (
          <div className="flex gap-2 mb-5">
            {[["task2","Task 2 – Essay","40 min · 250+ words"],["task1","Task 1 – Report","20 min · 150+ words"]].map(([k,l,sub]) => (
              <button key={k} onClick={() => { setTaskType(k); setPromptId(k==="task2"?"t2_1":"t1_1"); setUseCustom(false); reset(); }}
                className={`flex-1 py-3 rounded-xl border text-left px-4 transition-all ${taskType===k ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white hover:border-teal-300"}`}>
                <p className={`font-bold text-sm ${taskType===k ? "text-teal-700" : "text-slate-700"}`}>{l}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-12 gap-5">
          {/* LEFT COLUMN – Prompt + Editor */}
          <div className="col-span-8 space-y-4">
            {/* Prompt selection */}
            {!submitted && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Select Prompt</p>
                  <button onClick={generateAIPrompt} disabled={aiGenerating}
                    className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors flex items-center gap-1">
                    {aiGenerating ? "⟳ Generating…" : "✨ AI Generate Prompt"}
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap mb-3">
                  {prompts.map(p => (
                    <button key={p.id} onClick={() => { setPromptId(p.id); setUseCustom(false); }}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${!useCustom && promptId===p.id ? "bg-teal-600 text-white border-teal-600" : "border-slate-200 text-slate-600 hover:border-teal-300"}`}>
                      {p.type}
                    </button>
                  ))}
                  {useCustom && <button className="text-xs px-3 py-1.5 rounded-lg border bg-indigo-600 text-white border-indigo-600">AI Custom</button>}
                </div>
                {useCustom && (
                  <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} rows={3}
                    className="w-full border border-indigo-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50 resize-none mb-2" />
                )}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded mr-2 ${taskType==="task2" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}`}>{currentPrompt.type}</span>
                  <p className="text-sm text-slate-700 mt-2 leading-relaxed whitespace-pre-line">{currentPrompt.text}</p>
                  <p className="text-xs text-slate-400 mt-2">Write at least {minWords} words. Recommended: {recWords} words.</p>
                </div>
              </div>
            )}

            {/* Essay Editor or Feedback */}
            {!submitted ? (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Your Answer</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg ${wordCount >= minWords ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}`}>
                      {wordCount} / {minWords}+ words
                    </span>
                  </div>
                </div>
                <textarea value={essay} onChange={e => setEssay(e.target.value)}
                  className="w-full p-4 text-sm text-slate-700 leading-relaxed focus:outline-none resize-none"
                  style={{ minHeight: 380 }}
                  placeholder={`Write your ${taskType === "task1" ? "Task 1 report" : "Task 2 essay"} here...\n\n• Minimum ${minWords} words\n• Aim for ${recWords} words\n• Do NOT copy the question\n• ${taskType === "task2" ? "Structure: Introduction → Body 1 → Body 2 (→ Body 3) → Conclusion" : "Structure: Introduction + Overview → Body 1 → Body 2"}`} />
                {/* Word progress bar */}
                <div className="px-4 pb-3">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-1.5 rounded-full transition-all ${wordCount >= minWords ? "bg-teal-500" : "bg-amber-400"}`}
                      style={{ width: `${Math.min((wordCount / (minWords*1.2))*100, 100)}%` }} />
                  </div>
                </div>
                <div className="px-4 pb-4 flex items-center justify-between">
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <div className="ml-auto flex gap-2">
                    {wordCount > 0 && <button onClick={() => setEssay("")} className="text-xs text-slate-400 hover:text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">Clear</button>}
                    <button onClick={submitEssay} disabled={loading || wordCount < 20}
                      className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
                      {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Marking…</> : "Submit for Marking"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* The submitted essay */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Your Submitted Essay — {wordCount} words</p>
                    <button onClick={reset} className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors">Write New Essay</button>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
                    {essay}
                  </div>
                </div>
                {feedback && <FeedbackPanel feedback={feedback} essay={essay} />}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN – Tips */}
          <div className="col-span-4 space-y-4">
            <TipsSidebar taskType={taskType} />

            {/* Band score reference */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Band Score Reference</p>
              <div className="space-y-1.5">
                {[["9","Expert user","Fully operational command"],["8","Very good user","Fully operational, rare errors"],["7","Good user","Operational, some inaccuracies"],["6","Competent user","Effective, some inaccuracies"],["5","Modest user","Partial command"],["4","Limited user","Basic competence"],].map(([b, l, d]) => (
                  <div key={b} className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${bandBg(parseFloat(b))} ${bandColor(parseFloat(b))} border`}>{b}</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{l}</p>
                      <p className="text-xs text-slate-400">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scoring formula */}
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-2">📊 Scoring Formula</p>
              <div className="space-y-1 text-xs text-slate-600">
                <p>4 criteria × 25% each:</p>
                <p>• <span className="font-semibold">TR</span> – Task Response/Achievement</p>
                <p>• <span className="font-semibold">CC</span> – Coherence & Cohesion</p>
                <p>• <span className="font-semibold">LR</span> – Lexical Resource</p>
                <p>• <span className="font-semibold">GRA</span> – Grammar Range & Accuracy</p>
                <div className="mt-2 pt-2 border-t border-teal-200">
                  <p className="font-semibold text-teal-800">Overall = avg of 4 criteria</p>
                  <p className="text-xs text-teal-600 mt-0.5">Task 2 = 2× weight of Task 1 in final Writing band</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
