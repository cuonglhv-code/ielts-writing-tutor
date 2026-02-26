// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

// ── Constants ──────────────────────────────────────────────────────────────
const BAND_DESCRIPTORS = {
  5: { TA: "Incompletely addressed; limited development.", CC: "Not fully logical; cohesive devices limited.", LR: "Limited lexis; frequent errors.", GRA: "Limited structures; frequent errors." },
  6: { TA: "Main parts addressed but unevenly; ideas underdeveloped.", CC: "Generally coherent; cohesion mechanical.", LR: "Generally adequate; some imprecision.", GRA: "Mix of forms; accuracy drops in complex sentences." },
  7: { TA: "Appropriately addressed; clear developed position.", CC: "Logically organised; cohesive devices flexible.", LR: "Sufficient range; less common items used.", GRA: "Variety of complex structures; well controlled." },
  8: { TA: "Sufficiently addressed; well-developed position.", CC: "Logically sequenced; cohesion well managed.", LR: "Wide resource used fluently and flexibly.", GRA: "Wide range; majority error-free." }
};
const CHART_TYPES = ["Bar Chart", "Line Graph", "Pie Chart", "Table", "Process Diagram", "Map Comparison"];
const TASK2_TYPES = ["Opinion (Agree/Disagree)", "Discussion (Both Views)", "Problem & Solution", "Advantages & Disadvantages", "Two-Part Question"];
const TOPICS = ["Education", "Technology", "Environment", "Health", "Society", "Economy", "Transport", "Culture", "Crime", "Media", "Other"];
const DIFFICULTIES = ["Band 5–6", "Band 6–7", "Band 7–8"];
const COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#fb923c", "#22d3ee"];
const VISUAL_TYPES = ["Bar Chart", "Line Graph", "Pie Chart", "Table"];

const bandColor = b => b >= 7.5 ? "#34d399" : b >= 6.5 ? "#60a5fa" : b >= 5.5 ? "#fbbf24" : "#f87171";
const criteriaKeys = [
  { key: "TA", label: "Task Achievement" },
  { key: "CC", label: "Coherence & Cohesion" },
  { key: "LR", label: "Lexical Resource" },
  { key: "GRA", label: "Grammatical Range & Accuracy" }
];
const STORAGE_KEY = "ielts_question_bank";
const uid = () => Math.random().toString(36).slice(2, 9);

// ── Seed questions ─────────────────────────────────────────────────────────
const SEED_QUESTIONS = [
  {
    id: "seed-1", task: "Task 1", chartType: "Bar Chart", topic: "Education", difficulty: "Band 6–7",
    question: "The bar chart below shows the percentage of students enrolled in three types of higher education in five countries in 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    chartData: {
      title: "Student Enrolment in Higher Education by Country (2020)",
      xAxisLabel: "Country", yAxisLabel: "Percentage (%)", unit: "%",
      series: [
        { name: "University", color: "#60a5fa", data: [{ label: "UK", value: 65 }, { label: "USA", value: 70 }, { label: "Japan", value: 58 }, { label: "Brazil", value: 45 }, { label: "India", value: 38 }] },
        { name: "Vocational", color: "#34d399", data: [{ label: "UK", value: 25 }, { label: "USA", value: 20 }, { label: "Japan", value: 32 }, { label: "Brazil", value: 38 }, { label: "India", value: 42 }] }
      ],
      keyFeatures: ["UK and USA lead in university enrolment", "India has highest vocational proportion", "Japan shows balanced distribution"]
    }
  },
  {
    id: "seed-2", task: "Task 1", chartType: "Line Graph", topic: "Environment", difficulty: "Band 6–7",
    question: "The line graph below shows average annual CO₂ emissions per person in four countries between 1990 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    chartData: {
      title: "CO₂ Emissions per Capita 1990–2020 (tonnes)",
      xAxisLabel: "Year", yAxisLabel: "Tonnes per person", unit: "tonnes",
      series: [
        { name: "USA", color: "#f87171", data: [{ label: "1990", value: 19.2 }, { label: "1995", value: 19.8 }, { label: "2000", value: 20.1 }, { label: "2005", value: 19.5 }, { label: "2010", value: 17.6 }, { label: "2015", value: 16.4 }, { label: "2020", value: 14.2 }] },
        { name: "China", color: "#fbbf24", data: [{ label: "1990", value: 2.1 }, { label: "1995", value: 2.8 }, { label: "2000", value: 3.1 }, { label: "2005", value: 4.5 }, { label: "2010", value: 6.2 }, { label: "2015", value: 7.1 }, { label: "2020", value: 7.4 }] },
        { name: "Germany", color: "#60a5fa", data: [{ label: "1990", value: 12.8 }, { label: "1995", value: 11.2 }, { label: "2000", value: 10.4 }, { label: "2005", value: 9.8 }, { label: "2010", value: 9.1 }, { label: "2015", value: 8.5 }, { label: "2020", value: 7.3 }] },
        { name: "India", color: "#34d399", data: [{ label: "1990", value: 0.8 }, { label: "1995", value: 0.9 }, { label: "2000", value: 1.1 }, { label: "2005", value: 1.3 }, { label: "2010", value: 1.6 }, { label: "2015", value: 1.8 }, { label: "2020", value: 1.9 }] }
      ],
      keyFeatures: ["USA consistently highest but declining", "China shows dramatic rise", "India lowest throughout", "Germany steady decline"]
    }
  },
  {
    id: "seed-3", task: "Task 1", chartType: "Pie Chart", topic: "Society", difficulty: "Band 5–6",
    question: "The pie chart below shows how the average household in the UK spent its income in 2022. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    chartData: {
      title: "UK Average Household Expenditure 2022",
      unit: "%",
      series: [
        { name: "Spending", color: "#60a5fa", data: [{ label: "Housing", value: 28 }, { label: "Food", value: 18 }, { label: "Transport", value: 14 }, { label: "Leisure", value: 12 }, { label: "Clothing", value: 8 }, { label: "Health", value: 7 }, { label: "Other", value: 13 }] }
      ],
      keyFeatures: ["Housing is largest expenditure", "Food and transport together account for nearly a third", "Health is the smallest named category"]
    }
  },
  {
    id: "seed-4", task: "Task 1", chartType: "Table", topic: "Economy", difficulty: "Band 7–8",
    question: "The table below shows GDP growth rate (%), unemployment rate (%), and inflation rate (%) for five countries in 2023. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    chartData: {
      title: "Economic Indicators by Country (2023)",
      yAxisLabel: "Economic indicators",
      series: [
        { name: "GDP Growth (%)", data: [{ label: "UK", value: 0.4 }, { label: "USA", value: 2.5 }, { label: "Japan", value: 1.9 }, { label: "Germany", value: -0.3 }, { label: "India", value: 6.8 }] },
        { name: "Unemployment (%)", data: [{ label: "UK", value: 4.2 }, { label: "USA", value: 3.7 }, { label: "Japan", value: 2.6 }, { label: "Germany", value: 5.5 }, { label: "India", value: 7.9 }] },
        { name: "Inflation (%)", data: [{ label: "UK", value: 6.8 }, { label: "USA", value: 4.1 }, { label: "Japan", value: 3.2 }, { label: "Germany", value: 5.9 }, { label: "India", value: 5.4 }] }
      ],
      keyFeatures: ["India leads in GDP growth", "Germany is the only country with negative growth", "Japan has lowest unemployment", "UK has highest inflation"]
    }
  },
  {
    id: "seed-5", task: "Task 2", chartType: null, essayType: "Opinion (Agree/Disagree)", topic: "Technology", difficulty: "Band 6–7",
    question: "Some people believe that technology has made our lives more complicated. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
    chartData: null
  },
  {
    id: "seed-6", task: "Task 2", chartType: null, essayType: "Discussion (Both Views)", topic: "Education", difficulty: "Band 7–8",
    question: "Some people think that universities should focus on providing academic knowledge, while others believe they should prepare students for employment. Discuss both views and give your own opinion.",
    chartData: null
  },
  {
    id: "seed-7", task: "Task 2", chartType: null, essayType: "Problem & Solution", topic: "Environment", difficulty: "Band 6–7",
    question: "Many cities around the world are facing serious problems with air pollution. What are the main causes of this problem and what measures could be taken to address it?",
    chartData: null
  }
];

// ── Storage helpers ────────────────────────────────────────────────────────
async function loadBank() {
  try {
    const r = await window.storage.get(STORAGE_KEY);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}
async function saveBank(questions) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(questions)); } catch { }
}

// ── Chart renderers ────────────────────────────────────────────────────────
function renderBarChart(cd) {
  const labels = cd.series[0].data.map(d => d.label);
  const data = labels.map((lbl, i) => { const row = { label: lbl }; cd.series.forEach(s => { row[s.name] = s.data[i]?.value ?? 0; }); return row; });
  return (
    <div>
      <div className="text-xs text-center text-gray-400 mb-1 font-medium">{cd.title}</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 15, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} label={{ value: cd.yAxisLabel || "", angle: -90, position: "insideLeft", fill: "#6b7280", fontSize: 9, dx: -5 }} />
          <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          {cd.series.map((s, i) => <Bar key={s.name} dataKey={s.name} fill={s.color || COLORS[i]} radius={[3, 3, 0, 0]} />)}
        </BarChart>
      </ResponsiveContainer>
      {cd.xAxisLabel && <div className="text-xs text-center text-gray-500 mt-1">{cd.xAxisLabel}</div>}
    </div>
  );
}
function renderLineChart(cd) {
  const labels = cd.series[0].data.map(d => d.label);
  const data = labels.map((lbl, i) => { const row = { label: lbl }; cd.series.forEach(s => { row[s.name] = s.data[i]?.value ?? 0; }); return row; });
  return (
    <div>
      <div className="text-xs text-center text-gray-400 mb-1 font-medium">{cd.title}</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 15, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} label={{ value: cd.yAxisLabel || "", angle: -90, position: "insideLeft", fill: "#6b7280", fontSize: 9, dx: -5 }} />
          <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          {cd.series.map((s, i) => <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color || COLORS[i]} strokeWidth={2} dot={{ r: 3 }} />)}
        </LineChart>
      </ResponsiveContainer>
      {cd.xAxisLabel && <div className="text-xs text-center text-gray-500 mt-1">{cd.xAxisLabel}</div>}
    </div>
  );
}
function renderPieChart(cd) {
  const data = cd.series[0].data.map((d, i) => ({ name: d.label, value: d.value, fill: COLORS[i % COLORS.length] }));
  return (
    <div>
      <div className="text-xs text-center text-gray-400 mb-1 font-medium">{cd.title}</div>
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value"
            label={({ name, value }) => `${name}: ${value}%`} labelLine={{ stroke: "#6b7280", strokeWidth: 1 }}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Pie>
          <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} formatter={v => [`${v}%`]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
function renderTable(cd) {
  const cols = cd.series[0].data.map(d => d.label);
  return (
    <div className="overflow-x-auto">
      <div className="text-xs text-center text-gray-400 mb-2 font-medium">{cd.title}</div>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="bg-gray-700 text-gray-300 px-3 py-2 text-left border border-gray-600 font-semibold">Category</th>
            {cols.map(c => <th key={c} className="bg-gray-700 text-gray-300 px-3 py-2 border border-gray-600 font-semibold text-center">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {cd.series.map((s, i) => (
            <tr key={s.name} className={i % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}>
              <td className="px-3 py-2 border border-gray-700 font-medium text-gray-300">{s.name}</td>
              {s.data.map((d, j) => <td key={j} className="px-3 py-2 border border-gray-700 text-center text-gray-300">{d.value}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function ChartVisual({ chartType, chartData, compact = false }) {
  if (!chartData) return null;
  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-xl p-3 ${compact ? "" : "mt-3"}`}>
      {chartType === "Bar Chart" && renderBarChart(chartData)}
      {chartType === "Line Graph" && renderLineChart(chartData)}
      {chartType === "Pie Chart" && renderPieChart(chartData)}
      {chartType === "Table" && renderTable(chartData)}
      {chartData.keyFeatures?.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-500 mb-1 font-medium">Key features:</div>
          <div className="flex flex-wrap gap-1">{chartData.keyFeatures.map((f, i) => <span key={i} className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">{f}</span>)}</div>
        </div>
      )}
    </div>
  );
}

// ── Prompts ────────────────────────────────────────────────────────────────
function buildGeneratePrompt(chartType, taskType, subtype) {
  const isVisual = VISUAL_TYPES.includes(chartType);
  if (taskType === "Task 2") return `Generate a realistic Academic IELTS Task 2 "${subtype}" question.\nRespond ONLY with valid JSON:\n{ "question": "Full exam question", "context": null, "chartType": null, "chartData": null }`;
  if (!isVisual) return `Generate a realistic Academic IELTS Task 1 "${chartType}" question with a detailed text description.\nRespond ONLY with valid JSON:\n{ "question": "Full question including visual description", "context": "Note this is a ${chartType}", "chartType": "${chartType}", "chartData": null }`;
  return `Generate a realistic Academic IELTS Task 1 question using a "${chartType}". Include authentic exam-level data (2–4 series, 5–8 data points for line/bar). Data must tell an interesting story.
Respond ONLY with valid JSON, no markdown:
{
  "question": "The [chartType] below shows [description]. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
  "context": "One-line description",
  "chartType": "${chartType}",
  "chartData": {
    "title": "Chart title",
    "xAxisLabel": "X label",
    "yAxisLabel": "Y label with unit",
    "unit": "% or million etc",
    "series": [ { "name": "Series", "color": "#60a5fa", "data": [ { "label": "Category", "value": 42 } ] } ],
    "keyFeatures": ["Feature 1", "Feature 2", "Feature 3"]
  }
}
For Pie Chart: one series, values sum to 100. For Table: series = rows, label = column headers.`;
}

function buildFeedbackPrompt(taskType, chartType, question, chartData, answer, targetBand, history) {
  const nearest = [5, 6, 7, 8].reduce((p, c) => Math.abs(c - targetBand) < Math.abs(p - targetBand) ? c : p, 6);
  const d = BAND_DESCRIPTORS[nearest];
  const chartCtx = chartData ? `\nChart data: ${JSON.stringify(chartData)}` : "";
  const hist = history.map((h, i) => `Attempt ${i + 1}: Band ${h.overall}`).join(", ");
  return `You are a strict IELTS examiner marking Academic IELTS ${taskType}${chartType ? ` (${chartType})` : ""}.
Target band: ${targetBand}. Previous: ${hist || "none"}.
Band ${nearest}: TA:${d.TA} CC:${d.CC} LR:${d.LR} GRA:${d.GRA}
QUESTION: ${question}${chartCtx}
STUDENT RESPONSE: ${answer}
Respond ONLY with valid JSON, no markdown:
{
  "scores":{"TA":6.0,"CC":6.0,"LR":6.0,"GRA":6.0},
  "overall":6.0,
  "examinerSummary":"2-3 sentence overall comment",
  "strengths":["Specific strength with quote and criterion"],
  "improvements":[{"issue":"Label","criterion":"TA|CC|LR|GRA","original":"quote","improved":"rewritten at band ${targetBand}","explanation":"why better"}],
  "dataAccuracy":${chartData ? '"Comment on whether student correctly referenced key data points"' : 'null'},
  "vocabHighlights":["word/phrase"],
  "examTip":"One actionable tip"
}
Rules: scores from [4,4.5,5,5.5,6,6.5,7,7.5,8,9]. overall=mean rounded to 0.5. Be honest.`;
}

// ── Question Bank Editor ────────────────────────────────────────────────────
const emptyForm = () => ({
  id: "", task: "Task 1", chartType: "Bar Chart", essayType: TASK2_TYPES[0],
  topic: "Education", difficulty: "Band 6–7", question: "",
  chartData: { title: "", xAxisLabel: "", yAxisLabel: "", unit: "", series: [{ name: "Series 1", color: "#60a5fa", data: [{ label: "", value: "" }, { label: "", value: "" }] }], keyFeatures: ["", "", ""] }
});

function QuestionBankManager({ questions, onSave, onDelete, onClose }) {
  const [editing, setEditing] = useState(null);
  const [filterTask, setFilterTask] = useState("All");
  const [filterTopic, setFilterTopic] = useState("All");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = questions.filter(q =>
    (filterTask === "All" || q.task === filterTask) &&
    (filterTopic === "All" || q.topic === filterTopic)
  );

  const startNew = () => setEditing({ ...emptyForm(), id: uid() });
  const startEdit = q => {
    const f = { ...emptyForm(), ...q };
    if (!f.chartData) f.chartData = emptyForm().chartData;
    setEditing(f);
  };

  const save = () => {
    if (!editing.question.trim()) return alert("Please enter a question.");
    onSave(editing);
    setEditing(null);
  };

  const updateField = (path, val) => {
    setEditing(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = val;
      return next;
    });
  };

  const addSeries = () => setEditing(prev => ({ ...prev, chartData: { ...prev.chartData, series: [...prev.chartData.series, { name: `Series ${prev.chartData.series.length + 1}`, color: COLORS[prev.chartData.series.length % COLORS.length], data: prev.chartData.series[0].data.map(d => ({ label: d.label, value: "" })) }] } }));
  const removeSeries = i => setEditing(prev => ({ ...prev, chartData: { ...prev.chartData, series: prev.chartData.series.filter((_, j) => j !== i) } }));
  const addDataPoint = () => setEditing(prev => ({ ...prev, chartData: { ...prev.chartData, series: prev.chartData.series.map(s => ({ ...s, data: [...s.data, { label: "", value: "" }] })) } }));
  const removeDataPoint = i => setEditing(prev => ({ ...prev, chartData: { ...prev.chartData, series: prev.chartData.series.map(s => ({ ...s, data: s.data.filter((_, j) => j !== i) })) } }));

  if (editing) return (
    <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white text-sm">← Back</button>
        <h3 className="text-sm font-semibold">{editing.id && questions.find(q => q.id === editing.id) ? "Edit Question" : "New Question"}</h3>
      </div>
      <div className="space-y-4">
        {/* Task type */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Task Type</label>
          <div className="flex gap-2">
            {["Task 1", "Task 2"].map(t => (
              <button key={t} onClick={() => updateField("task", t)} className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${editing.task === t ? "bg-blue-600 border-blue-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400"}`}>{t}</button>
            ))}
          </div>
        </div>
        {/* Chart/Essay type */}
        {editing.task === "Task 1" ? (
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Chart Type</label>
            <div className="flex flex-wrap gap-1.5">
              {CHART_TYPES.map(t => <button key={t} onClick={() => updateField("chartType", t)} className={`px-3 py-1 rounded-full text-xs border transition-all ${editing.chartType === t ? "bg-blue-600 border-blue-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400"}`}>{t}</button>)}
            </div>
          </div>
        ) : (
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Essay Type</label>
            <div className="flex flex-wrap gap-1.5">
              {TASK2_TYPES.map(t => <button key={t} onClick={() => updateField("essayType", t)} className={`px-3 py-1 rounded-full text-xs border transition-all ${editing.essayType === t ? "bg-blue-600 border-blue-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400"}`}>{t}</button>)}
            </div>
          </div>
        )}
        {/* Topic & Difficulty */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Topic</label>
            <select value={editing.topic} onChange={e => updateField("topic", e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white">
              {TOPICS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Difficulty</label>
            <select value={editing.difficulty} onChange={e => updateField("difficulty", e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white">
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        {/* Question text */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Question Text</label>
          <textarea value={editing.question} onChange={e => updateField("question", e.target.value)} rows={4} placeholder="Enter the full IELTS question as it would appear in the exam…" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500" />
        </div>
        {/* Chart data builder */}
        {editing.task === "Task 1" && VISUAL_TYPES.includes(editing.chartType) && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-blue-400">📊 Chart Data</div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-gray-500 mb-1 block">Chart Title</label><input value={editing.chartData.title} onChange={e => updateField("chartData.title", e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500" placeholder="e.g. Student Enrolment 2020" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Unit</label><input value={editing.chartData.unit} onChange={e => updateField("chartData.unit", e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500" placeholder="%, million, km…" /></div>
              {editing.chartType !== "Pie Chart" && (<>
                <div><label className="text-xs text-gray-500 mb-1 block">X-Axis Label</label><input value={editing.chartData.xAxisLabel} onChange={e => updateField("chartData.xAxisLabel", e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500" placeholder="e.g. Country" /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Y-Axis Label</label><input value={editing.chartData.yAxisLabel} onChange={e => updateField("chartData.yAxisLabel", e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500" placeholder="e.g. Percentage (%)" /></div>
              </>)}
            </div>
            {/* Data points header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-500 font-medium">Data Points</label>
                <button onClick={addDataPoint} className="text-xs text-blue-400 hover:text-blue-300">+ Add column</button>
              </div>
              {/* Column labels */}
              <div className="flex gap-1 mb-1 ml-20">
                {editing.chartData.series[0].data.map((d, i) => (
                  <div key={i} className="flex-1 flex gap-0.5 items-center">
                    <input value={d.label} onChange={e => editing.chartData.series.forEach((_, si) => updateField(`chartData.series.${si}.data.${i}.label`, e.target.value))} className="flex-1 bg-gray-900 border border-gray-700 rounded px-1 py-1 text-xs text-white focus:outline-none focus:border-blue-500 min-w-0" placeholder={`Col ${i + 1}`} />
                    {editing.chartData.series[0].data.length > 2 && <button onClick={() => removeDataPoint(i)} className="text-gray-600 hover:text-red-400 text-xs px-0.5">×</button>}
                  </div>
                ))}
              </div>
              {/* Series rows */}
              {editing.chartData.series.map((s, si) => (
                <div key={si} className="flex gap-1 mb-1 items-center">
                  <div className="w-20 shrink-0">
                    <input value={s.name} onChange={e => updateField(`chartData.series.${si}.name`, e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded px-1 py-1 text-xs text-white focus:outline-none focus:border-blue-500" placeholder={`Series ${si + 1}`} />
                  </div>
                  {s.data.map((d, i) => (
                    <input key={i} value={d.value} onChange={e => updateField(`chartData.series.${si}.data.${i}.value`, Number(e.target.value))} type="number" className="flex-1 bg-gray-900 border border-gray-700 rounded px-1 py-1 text-xs text-white focus:outline-none focus:border-blue-500 min-w-0" />
                  ))}
                  {editing.chartData.series.length > 1 && <button onClick={() => removeSeries(si)} className="text-gray-600 hover:text-red-400 text-xs px-1">×</button>}
                </div>
              ))}
              {editing.chartType !== "Pie Chart" && <button onClick={addSeries} className="text-xs text-blue-400 hover:text-blue-300 mt-1">+ Add series</button>}
            </div>
            {/* Key features */}
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Key Features (shown as hints)</label>
              {editing.chartData.keyFeatures.map((f, i) => (
                <input key={i} value={f} onChange={e => updateField(`chartData.keyFeatures.${i}`, e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white mb-1 focus:outline-none focus:border-blue-500" placeholder={`Key feature ${i + 1}…`} />
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button onClick={save} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold">Save Question</button>
          <button onClick={() => setEditing(null)} className="px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-400 rounded-xl text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center gap-3 shrink-0">
        <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">← Back</button>
        <h3 className="text-sm font-semibold flex-1">Question Bank Manager</h3>
        <button onClick={startNew} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-medium">+ New Question</button>
      </div>
      <div className="px-4 py-2 border-b border-gray-800 flex gap-2 shrink-0">
        <select value={filterTask} onChange={e => setFilterTask(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white">
          <option>All</option><option>Task 1</option><option>Task 2</option>
        </select>
        <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white">
          <option>All</option>{TOPICS.map(t => <option key={t}>{t}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-500 self-center">{filtered.length} questions</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No questions yet. Click "+ New Question" to add one.</div>}
        {filtered.map(q => (
          <div key={q.id} className="bg-gray-800 border border-gray-700 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">{q.task}</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{q.chartType || q.essayType}</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{q.topic}</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{q.difficulty}</span>
                  {q.id.startsWith("seed-") && <span className="text-xs text-gray-500 italic">sample</span>}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{q.question}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(q)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-lg">Edit</button>
                {confirmDelete === q.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => { onDelete(q.id); setConfirmDelete(null); }} className="text-xs bg-red-700 hover:bg-red-600 text-white px-2 py-1 rounded-lg">Yes</button>
                    <button onClick={() => setConfirmDelete(null)} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-lg">No</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(q.id)} className="text-xs bg-gray-700 hover:bg-red-800 text-gray-400 hover:text-red-300 px-2 py-1 rounded-lg">Del</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Question Picker ────────────────────────────────────────────────────────
function QuestionPicker({ questions, onSelect, onClose }) {
  const [filterTask, setFilterTask] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterTopic, setFilterTopic] = useState("All");
  const [filterDiff, setFilterDiff] = useState("All");
  const [preview, setPreview] = useState(null);

  const types = filterTask === "Task 1" ? CHART_TYPES : filterTask === "Task 2" ? TASK2_TYPES : [...CHART_TYPES, ...TASK2_TYPES];
  const filtered = questions.filter(q =>
    (filterTask === "All" || q.task === filterTask) &&
    (filterType === "All" || (q.chartType === filterType || q.essayType === filterType)) &&
    (filterTopic === "All" || q.topic === filterTopic) &&
    (filterDiff === "All" || q.difficulty === filterDiff)
  );

  if (preview) return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2 shrink-0">
        <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-white text-sm">← Back</button>
        <h3 className="text-sm font-semibold">Preview Question</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">{preview.task}</span>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{preview.chartType || preview.essayType}</span>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{preview.topic}</span>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{preview.difficulty}</span>
        </div>
        <p className="text-sm text-gray-200 leading-relaxed mb-3">{preview.question}</p>
        {preview.chartData && <ChartVisual chartType={preview.chartType} chartData={preview.chartData} />}
        {!VISUAL_TYPES.includes(preview.chartType) && preview.task === "Task 1" && (
          <div className="mt-3 text-xs text-amber-400 bg-amber-950 border border-amber-800 rounded-lg px-3 py-2">⚠️ In the real exam, a {preview.chartType?.toLowerCase()} image would appear here.</div>
        )}
      </div>
      <div className="p-4 border-t border-gray-800 shrink-0">
        <button onClick={() => onSelect(preview)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold">Use This Question → Start Writing</button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2 shrink-0">
        <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">← Back</button>
        <h3 className="text-sm font-semibold">Question Bank</h3>
        <span className="ml-auto text-xs text-gray-500">{filtered.length} questions</span>
      </div>
      {/* Filters */}
      <div className="px-4 py-2 border-b border-gray-800 flex flex-wrap gap-2 shrink-0">
        <select value={filterTask} onChange={e => { setFilterTask(e.target.value); setFilterType("All"); }} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white">
          <option>All</option><option>Task 1</option><option>Task 2</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white">
          <option>All</option>{types.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white">
          <option>All</option>{TOPICS.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white">
          <option>All</option>{DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No questions match your filters.</div>}
        {filtered.map(q => (
          <button key={q.id} onClick={() => setPreview(q)} className="w-full text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-600 rounded-xl p-3 transition-all">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">{q.task}</span>
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{q.chartType || q.essayType}</span>
                  <span className="text-xs text-gray-500">{q.topic}</span>
                  <span className="text-xs text-gray-600">{q.difficulty}</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{q.question}</p>
              </div>
              <span className="text-blue-400 text-sm shrink-0">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Feedback sub-components ────────────────────────────────────────────────
function ScoreCard({ label, score }) {
  const col = bandColor(score);
  return (
    <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-400 font-medium leading-tight">{label}</span>
        <span className="text-xl font-bold ml-2 shrink-0" style={{ color: col }}>{score}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${((score - 1) / 8) * 100}%`, backgroundColor: col }} />
      </div>
    </div>
  );
}
function RadarPanel({ scores }) {
  const data = criteriaKeys.map(c => ({ subject: c.key, score: scores[c.key] || 0, fullMark: 9 }));
  return (
    <ResponsiveContainer width="100%" height={210}>
      <RadarChart data={data} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 600 }} />
        <Radar dataKey="score" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.25} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState("setup");
  const [taskType, setTaskType] = useState("Task 1");
  const [chartType, setChartType] = useState("Bar Chart");
  const [subtype, setSubtype] = useState(TASK2_TYPES[0]);
  const [targetBand, setTargetBand] = useState(7);
  const [question, setQuestion] = useState("");
  const [chartData, setChartData] = useState(null);
  const [sourceMode, setSourceMode] = useState(null); // "generate"|"bank"|"custom"
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState([]);
  const [feedbackTab, setFeedbackTab] = useState("narrative");
  const [showManager, setShowManager] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [bankLoaded, setBankLoaded] = useState(false);

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const minWords = taskType === "Task 1" ? 150 : 250;

  useEffect(() => {
    loadBank().then(data => {
      setBankQuestions(data || SEED_QUESTIONS);
      setBankLoaded(true);
    });
  }, []);

  useEffect(() => { if (bankLoaded) saveBank(bankQuestions); }, [bankQuestions, bankLoaded]);

  useEffect(() => { setQuestion(""); setChartData(null); setSourceMode(null); }, [taskType, chartType, subtype]);

  const callAPI = async (prompt, maxTokens = 1400) => {
    const res = await fetch("/api/anthropic", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxTokens, prompt })
    });
    const data = await res.json();
    const raw = data.content?.map(b => b.text || "").join("").replace(/```json|```/g, "").trim();
    return JSON.parse(raw);
  };

  const generateQuestion = async () => {
    setLoading(true); setLoadingMsg("Generating question…"); setChartData(null); setQuestion("");
    try {
      const type = taskType === "Task 1" ? chartType : subtype;
      const parsed = await callAPI(buildGeneratePrompt(chartType, taskType, type), 1600);
      setQuestion(parsed.question);
      if (parsed.chartData) setChartData(parsed.chartData);
    } catch { setQuestion("Failed to generate. Please try another option."); }
    setLoading(false); setLoadingMsg("");
  };

  const submitForMarking = async () => {
    if (!answer.trim() || !question.trim()) return;
    setLoading(true); setLoadingMsg("Marking your response…"); setFeedback(null);
    try {
      const type = taskType === "Task 1" ? chartType : subtype;
      const parsed = await callAPI(buildFeedbackPrompt(taskType, type, question, chartData, answer, targetBand, history), 1900);
      setFeedback(parsed);
      setHistory(prev => [...prev, { ...parsed.scores, overall: parsed.overall }]);
      setStep("feedback"); setFeedbackTab("narrative");
    } catch { alert("Marking failed. Please try again."); }
    setLoading(false); setLoadingMsg("");
  };

  const selectFromBank = (q) => {
    setTaskType(q.task);
    if (q.task === "Task 1") setChartType(q.chartType || "Bar Chart");
    else setSubtype(q.essayType || TASK2_TYPES[0]);
    setQuestion(q.question);
    setChartData(q.chartData || null);
    setSourceMode("bank");
    setShowPicker(false);
    setStep("write");
  };

  const saveQuestion = (q) => {
    setBankQuestions(prev => {
      const idx = prev.findIndex(x => x.id === q.id);
      return idx >= 0 ? prev.map(x => x.id === q.id ? q : x) : [...prev, q];
    });
  };
  const deleteQuestion = id => setBankQuestions(prev => prev.filter(x => x.id !== id));

  const reset = () => { setStep("setup"); setAnswer(""); setQuestion(""); setChartData(null); setFeedback(null); setSourceMode(null); };
  const tryAgain = () => { setAnswer(""); setFeedback(null); setStep("write"); };

  if (showManager) return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col" style={{ fontFamily: "Inter,sans-serif" }}>
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">IE</div>
        <span className="text-sm font-semibold">Question Bank Manager</span>
      </div>
      <QuestionBankManager questions={bankQuestions} onSave={saveQuestion} onDelete={deleteQuestion} onClose={() => setShowManager(false)} />
    </div>
  );

  if (showPicker) return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col" style={{ fontFamily: "Inter,sans-serif" }}>
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">IE</div>
        <span className="text-sm font-semibold">Choose a Question</span>
      </div>
      <QuestionPicker questions={bankQuestions} onSelect={selectFromBank} onClose={() => setShowPicker(false)} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col" style={{ fontFamily: "Inter,sans-serif" }}>
      {/* Top bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">IE</div>
          <div>
            <div className="text-sm font-semibold">IELTS Writing Tutor</div>
            <div className="text-xs text-gray-500">Task 1 & 2 · Visual · AI Examiner</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowManager(true)} className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1 rounded-lg hidden sm:block">⚙️ Manage Bank</button>
          <select value={targetBand} onChange={e => setTargetBand(Number(e.target.value))} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white">
            {[5, 5.5, 6, 6.5, 7, 7.5, 8].map(b => <option key={b} value={b}>Band {b}</option>)}
          </select>
          {step !== "setup" && <button onClick={reset} className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1 rounded-lg">New Task</button>}
        </div>
      </div>

      {/* Step bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex gap-1 shrink-0">
        {[["setup", "1", "Choose"], ["write", "2", "Write"], ["feedback", "3", "Feedback"]].map(([s, n, label]) => (
          <div key={s} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${step === s ? "bg-blue-600 text-white" : "text-gray-500"}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${step === s ? "bg-blue-400" : "bg-gray-700"}`}>{n}</span>
            {label}
          </div>
        ))}
      </div>

      {/* ── STEP 1 ── */}
      {step === "setup" && (
        <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
          <h2 className="text-base font-semibold mb-4">Set up your practice session</h2>
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block">Task Type</label>
            <div className="flex gap-2">
              {["Task 1", "Task 2"].map(t => (
                <button key={t} onClick={() => setTaskType(t)} className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${taskType === t ? "bg-blue-600 border-blue-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                  {t}<div className="text-xs font-normal opacity-70 mt-0.5">{t === "Task 1" ? "Describe a visual · 150+ words" : "Write an essay · 250+ words"}</div>
                </button>
              ))}
            </div>
          </div>
          {taskType === "Task 1" ? (
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-2 block">Chart / Diagram Type</label>
              <div className="grid grid-cols-3 gap-2">
                {CHART_TYPES.map(t => {
                  const icons = { "Bar Chart": "▊", "Line Graph": "📈", "Pie Chart": "◑", "Table": "⊞", "Process Diagram": "⟳", "Map Comparison": "🗺" };
                  return <button key={t} onClick={() => setChartType(t)} className={`py-3 px-2 rounded-xl text-xs border transition-all flex flex-col items-center gap-1 ${chartType === t ? "bg-blue-600 border-blue-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                    <span className="text-lg">{icons[t]}</span><span>{t}</span>
                    {!VISUAL_TYPES.includes(t) && <span className="text-xs opacity-60">text only</span>}
                  </button>;
                })}
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-2 block">Essay Type</label>
              <div className="flex flex-wrap gap-2">
                {TASK2_TYPES.map(t => <button key={t} onClick={() => setSubtype(t)} className={`px-3 py-1.5 rounded-full text-xs border transition-all ${subtype === t ? "bg-blue-600 border-blue-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"}`}>{t}</button>)}
              </div>
            </div>
          )}

          {/* 3 source options */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block">Choose a Question</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[["✨", "Generate", "AI-generated question", "generate"], ["📚", "Question Bank", "Choose from saved questions", "bank"], ["📋", "Paste Own", "Enter your own question", "custom"]].map(([icon, title, desc, mode]) => (
                <button key={mode} onClick={() => { setSourceMode(mode); if (mode === "generate") generateQuestion(); if (mode === "bank") setShowPicker(true); if (mode === "custom") { setQuestion(""); setChartData(null); } }}
                  className={`py-3 px-2 rounded-xl text-xs border transition-all flex flex-col items-center gap-1 text-center ${sourceMode === mode ? "bg-blue-600 border-blue-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                  <span className="text-xl">{icon}</span>
                  <span className="font-medium">{title}</span>
                  <span className="opacity-70 leading-tight">{desc}</span>
                </button>
              ))}
            </div>
            {sourceMode === "custom" && (
              <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Paste your IELTS question here…" rows={4}
                className="w-full bg-gray-800 border border-blue-600 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-500 resize-none focus:outline-none" />
            )}
            {question && sourceMode === "generate" && <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-gray-200 leading-relaxed">{question}</div>}
            {chartData && <ChartVisual chartType={chartType} chartData={chartData} />}
          </div>
          {question && (
            <button onClick={() => setStep("write")} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all">Start Writing →</button>
          )}
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === "write" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="overflow-y-auto flex-1 p-3 space-y-3">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">{taskType}</span>
                <span className="text-xs text-gray-500">{taskType === "Task 1" ? chartType : subtype}</span>
                <span className="ml-auto text-xs text-gray-500">Min {minWords} words · Band {targetBand}</span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">{question}</p>
              {chartData && <ChartVisual chartType={chartType} chartData={chartData} />}
              {!VISUAL_TYPES.includes(chartType) && taskType === "Task 1" && <div className="mt-2 text-xs text-amber-400 bg-amber-950 border border-amber-800 rounded-lg px-3 py-1.5">⚠️ In the real exam, a {chartType.toLowerCase()} image would appear here.</div>}
            </div>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder={`Write your ${taskType} response here…`} rows={10}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500 leading-relaxed" />
          </div>
          <div className="shrink-0 bg-gray-900 border-t border-gray-800 px-4 py-3 flex items-center justify-between">
            <div className={`text-xs font-medium ${wordCount >= minWords ? "text-emerald-400" : wordCount >= minWords * 0.8 ? "text-yellow-400" : "text-gray-500"}`}>
              {wordCount} / {minWords} words {wordCount >= minWords ? "✓" : ""}
            </div>
            <button onClick={submitForMarking} disabled={loading || !answer.trim() || wordCount < 50}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl text-sm font-semibold transition-all">
              {loading ? loadingMsg : "Submit for Marking →"}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 ── */}
      {step === "feedback" && feedback && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="text-center shrink-0">
              <div className="text-3xl font-bold" style={{ color: bandColor(feedback.overall) }}>{feedback.overall}</div>
              <div className="text-xs text-gray-500">Overall</div>
            </div>
            <div className="flex-1 text-xs text-gray-300 leading-relaxed italic hidden sm:block">"{feedback.examinerSummary}"</div>
            <button onClick={tryAgain} className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg shrink-0">Try Again</button>
          </div>
          <div className="text-xs text-gray-300 leading-relaxed italic px-4 py-2 sm:hidden border-b border-gray-800">"{feedback.examinerSummary}"</div>
          <div className="flex border-b border-gray-800 bg-gray-900 shrink-0">
            {[["narrative", "📝 Feedback"], ["scoreboard", "📊 Scores"], ["history", "📈 Progress"]].map(([t, label]) => (
              <button key={t} onClick={() => setFeedbackTab(t)} className={`px-4 py-2 text-xs font-medium transition-all ${feedbackTab === t ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-500 hover:text-gray-300"}`}>{label}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {feedbackTab === "narrative" && (
              <div className="space-y-4 max-w-2xl mx-auto">
                {feedback.dataAccuracy && <div className="bg-blue-950 border border-blue-800 rounded-xl p-3"><div className="text-xs font-semibold text-blue-400 mb-1">📊 Data Accuracy</div><p className="text-xs text-gray-300 leading-relaxed">{feedback.dataAccuracy}</p></div>}
                <div className="bg-emerald-950 border border-emerald-800 rounded-xl p-4">
                  <div className="text-sm font-semibold text-emerald-400 mb-3">✅ What You Did Well</div>
                  <ul className="space-y-2">{feedback.strengths.map((s, i) => <li key={i} className="flex gap-2 text-xs text-gray-300 leading-relaxed"><span className="text-emerald-500 mt-0.5 shrink-0">•</span><span>{s}</span></li>)}</ul>
                </div>
                <div className="bg-amber-950 border border-amber-800 rounded-xl p-4">
                  <div className="text-sm font-semibold text-amber-400 mb-3">🔧 What Could Be Better</div>
                  <div className="space-y-4">{feedback.improvements.map((imp, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap"><span className="text-xs font-semibold text-amber-300">{imp.issue}</span><span className="text-xs bg-amber-900 text-amber-300 px-1.5 py-0.5 rounded">{imp.criterion}</span></div>
                      <div className="bg-gray-900 rounded-lg p-2 border-l-2 border-red-500"><div className="text-xs text-gray-500 mb-0.5">Original</div><div className="text-xs text-gray-300 italic">"{imp.original}"</div></div>
                      <div className="bg-gray-900 rounded-lg p-2 border-l-2 border-emerald-500"><div className="text-xs text-gray-500 mb-0.5">Improved (Band {targetBand})</div><div className="text-xs text-emerald-300 italic">"{imp.improved}"</div></div>
                      <div className="text-xs text-gray-400 pl-2">{imp.explanation}</div>
                    </div>
                  ))}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-3"><div className="text-xs font-semibold text-blue-400 mb-2">📚 Vocab Highlights</div><div className="flex flex-wrap gap-1.5">{feedback.vocabHighlights.map((v, i) => <span key={i} className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">{v}</span>)}</div></div>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-3"><div className="text-xs font-semibold text-purple-400 mb-2">💡 Exam Tip</div><div className="text-xs text-gray-300 leading-relaxed">{feedback.examTip}</div></div>
                </div>
              </div>
            )}
            {feedbackTab === "scoreboard" && (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4"><div className="text-xs font-semibold text-gray-400 mb-1 text-center">Criteria Radar</div><RadarPanel scores={feedback.scores} /></div>
                <div className="grid grid-cols-2 gap-3">{criteriaKeys.map(c => <ScoreCard key={c.key} label={c.label} score={feedback.scores[c.key]} />)}</div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  <div className="text-xs font-semibold text-gray-400 mb-3">Gap to Target Band {targetBand}</div>
                  {criteriaKeys.map(c => {
                    const gap = targetBand - feedback.scores[c.key]; const col = gap <= 0 ? "#34d399" : gap <= 1 ? "#fbbf24" : "#f87171"; return (
                      <div key={c.key} className="flex items-center gap-3 mb-2">
                        <div className="text-xs text-gray-400 w-8">{c.key}</div>
                        <div className="flex-1 bg-gray-700 rounded-full h-2"><div className="h-2 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (feedback.scores[c.key] / 9) * 100)}%`, backgroundColor: col }} /></div>
                        <div className="text-xs font-medium w-12 text-right" style={{ color: col }}>{gap <= 0 ? "✓ met" : `+${gap.toFixed(1)}`}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {feedbackTab === "history" && (
              <div className="max-w-2xl mx-auto space-y-4">
                {history.length < 2 ? <div className="text-center py-12 text-gray-500 text-sm">Submit 2+ attempts to see your progress chart.</div> : (
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <div className="text-xs font-semibold text-gray-400 mb-3">Band Score Trend</div>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={history.map((h, i) => ({ attempt: `#${i + 1}`, ...h }))} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                        <XAxis dataKey="attempt" tick={{ fill: "#6b7280", fontSize: 10 }} /><YAxis domain={[4, 9]} tick={{ fill: "#6b7280", fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
                        <Line type="monotone" dataKey="overall" stroke="#60a5fa" strokeWidth={2.5} dot={{ fill: "#60a5fa", r: 4 }} name="Overall" />
                        <Line type="monotone" dataKey="TA" stroke="#34d399" strokeWidth={1.5} dot={false} name="TA" />
                        <Line type="monotone" dataKey="CC" stroke="#fbbf24" strokeWidth={1.5} dot={false} name="CC" />
                        <Line type="monotone" dataKey="LR" stroke="#f87171" strokeWidth={1.5} dot={false} name="LR" />
                        <Line type="monotone" dataKey="GRA" stroke="#a78bfa" strokeWidth={1.5} dot={false} name="GRA" />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex gap-3 mt-1 flex-wrap">{[["Overall", "#60a5fa"], ["TA", "#34d399"], ["CC", "#fbbf24"], ["LR", "#f87171"], ["GRA", "#a78bfa"]].map(([l, c]) => <div key={l} className="flex items-center gap-1"><div className="w-4 h-0.5" style={{ backgroundColor: c }} /><span className="text-xs text-gray-500">{l}</span></div>)}</div>
                  </div>
                )}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  <div className="text-xs font-semibold text-gray-400 mb-3">Attempt History</div>
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-700 last:border-0 flex-wrap">
                      <span className="text-xs text-gray-500 w-16">Attempt {i + 1}</span>
                      <span className="text-sm font-bold" style={{ color: bandColor(h.overall) }}>{h.overall}</span>
                      <div className="flex gap-2 ml-auto flex-wrap">{["TA", "CC", "LR", "GRA"].map(k => <span key={k} className="text-xs text-gray-400">{k}: <span style={{ color: bandColor(h[k]) }}>{h[k]}</span></span>)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-gray-950 bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl px-8 py-6 text-center">
            <div className="flex gap-1.5 justify-center mb-3">{[0, 1, 2].map(i => <div key={i} className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>
            <div className="text-sm text-gray-300">{loadingMsg}</div>
          </div>
        </div>
      )}
    </div>
  );
}
