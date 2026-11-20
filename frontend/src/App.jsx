// File Location: frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  Cpu, BookOpen, Layers, Terminal, Award, FileText, Activity,
  Sun, Moon, CheckCircle, HelpCircle, BarChart2, Lock, Sliders,
  BrainCircuit, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';

export default function App() {
  const [sutras, setSutras] = useState([]);
  const [selectedSutra, setSelectedSutra] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [resultData, setResultData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const [showTextDetails, setShowTextDetails] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/sutras")
      .then(res => res.json())
      .then(data => {
        setSutras(data);
      })
      .catch(err => console.error("Error fetching sutras:", err));
  }, []);

  const handleCompute = (customSutra = null, customVal = null) => {
    const activeSutra = customSutra || selectedSutra;
    if (!activeSutra) return;

    setAiData(null);
    setErrorMsg("");

    let val = 0;
    if (activeSutra.type === "Static") {
      val = parseFloat(activeSutra.default_input || "0");
    } else {
      const rawStr = customVal !== null ? String(customVal).trim() : String(inputValue).trim();
      const parsed = Number(rawStr);
      if (rawStr === "" || Number.isNaN(parsed) || !Number.isFinite(parsed)) {
        setResultData(null);
        setErrorMsg("Please enter a valid finite number before computing.");
        return;
      }
      val = parsed;
    }

    setLoading(true);

    // Call Primary Deterministic Engine
    fetch("http://localhost:8000/api/compute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method_id: activeSutra.id, input_value: val })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => { throw new Error(errData.detail || "Computation failed"); });
        }
        return res.json();
      })
      .then(data => {
        setResultData(data);
        setLoading(false);
      })
      .catch(err => {
        setResultData(null);
        setErrorMsg(err.message);
        setLoading(false);
      });

    // Call Secondary ML Surrogate SHAP Engine
    fetch("http://localhost:8000/api/ai-explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method_id: activeSutra.id, input_value: val })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("HTTP error");
        }
        return res.json();
      })
      .then(data => {
        if (data && typeof data.supported === "boolean") {
          setAiData(data);
        } else {
          setAiData({
            supported: false,
            reason: "invalid_response",
            message: "AI explanation unavailable for this input"
          });
        }
      })
      .catch(() => {
        setAiData({
          supported: false,
          reason: "http_error",
          message: "AI explanation unavailable for this input"
        });
      });
  };

  useEffect(() => {
    if (selectedSutra && selectedSutra.type === "Static") {
      handleCompute(selectedSutra, 0);
    }
  }, [selectedSutra]);

  const isStatic = selectedSutra?.type === "Static";
  const STEP_PREVIEW_LIMIT = 4;

  return (
    <div className={`min-h-screen font-sans p-4 md:p-8 transition-colors duration-300 print-root ${darkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto space-y-6">

        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 6mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            html, body, #root, .print-root {
              background-color: ${darkMode ? '#0b0f19' : '#f1f5f9'} !important;
              color: ${darkMode ? '#f1f5f9' : '#0f172a'} !important;
              min-height: 0 !important;
              height: auto !important;
              margin: 0 !important;
              padding: 2mm !important;
              display: block !important;
            }
            .no-print-btn {
              display: none !important;
            }
            .print-force-show {
              display: block !important;
            }
            .print-force-grid {
              display: grid !important;
            }
            .print-section {
              break-inside: auto !important;
              page-break-inside: auto !important;
              margin-bottom: 10px !important;
              padding: 12px !important;
              display: block !important;
              box-shadow: none !important;
              background-color: ${darkMode ? '#111827' : '#ffffff'} !important;
              color: ${darkMode ? '#f1f5f9' : '#0f172a'} !important;
              border: 1px solid ${darkMode ? '#334155' : '#cbd5e1'} !important;
            }
            .print-flow-box {
              break-inside: auto !important;
              page-break-inside: auto !important;
              margin-bottom: 8px !important;
              padding: 12px !important;
              display: block !important;
              background-color: ${darkMode ? '#172033' : '#f8fafc'} !important;
              color: ${darkMode ? '#f1f5f9' : '#0f172a'} !important;
              border: 1px solid ${darkMode ? '#334155' : '#cbd5e1'} !important;
            }
            .print-atomic {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
              margin-bottom: 6px !important;
              background-color: ${darkMode ? '#172033' : '#f8fafc'} !important;
              color: ${darkMode ? '#f1f5f9' : '#0f172a'} !important;
              border: 1px solid ${darkMode ? '#334155' : '#cbd5e1'} !important;
            }
            .print-stack {
              display: block !important;
            }
            .print-stack > * {
              width: 100% !important;
              margin-bottom: 8px !important;
            }
            .print-graph-box {
              height: 245px !important;
              min-height: 245px !important;
              overflow: visible !important;
              break-inside: avoid !important;
              page-break-inside: avoid !important;
              display: block !important;
              background-color: ${darkMode ? '#0d131f' : '#ffffff'} !important;
            }
            .print-svg {
              width: 100% !important;
              height: 190px !important;
              display: block !important;
              overflow: visible !important;
            }
          }
        `}</style>

        {/* Header */}
        <header className={`print-atomic flex flex-col md:flex-row justify-between items-start md:items-center p-5 rounded-2xl shadow-lg gap-4 border transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 border rounded-xl ${darkMode ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' : 'bg-amber-100 border-amber-400 text-amber-900'}`}>
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <h1 className={`text-2xl font-black tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>PRISM</h1>
              <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Explainable AI Framework for Computational Modeling of Ancient Indian Mathematical Approximation Techniques</p>
            </div>
          </div>
          <div className="flex items-center gap-3 no-print-btn">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition cursor-pointer ${darkMode ? 'bg-[#1f2937] border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-200 border-slate-400 text-slate-900 hover:bg-slate-300'}`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
            {selectedSutra && (
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                <FileText className="w-4 h-4" /> Export XAI Report
              </button>
            )}
          </div>
        </header>

        {/* Sutra Selector Bar */}
        <section className={`print-section p-6 rounded-2xl shadow-lg space-y-5 border transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
          <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${selectedSutra ? 'border-b pb-5' : ''} ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div>
              <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
                <Terminal className="w-4 h-4" /> Classical & Vedic Computational Engine
              </div>
              <h2 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Select a Sutra / Approximation Method</h2>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Choose a classical algorithm below to inspect its primary source, step-by-step trace, and error analysis.</p>
            </div>
            <div className="w-full md:w-[460px]">
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                Method Catalog ({sutras.length} Sutras / Approximation Methods)
              </label>
              <select
                className={`w-full text-xs font-bold rounded-xl px-4 py-3 outline-none border cursor-pointer transition-colors duration-300 ${darkMode ? 'bg-[#1f2937] border-slate-700 text-slate-100 focus:border-amber-500' : 'bg-slate-50 border-slate-400 text-slate-900 focus:border-amber-600'}`}
                value={selectedSutra ? selectedSutra.id : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setSelectedSutra(null);
                    setResultData(null);
                    setAiData(null);
                    setErrorMsg("");
                    return;
                  }
                  const found = sutras.find(s => s.id === val);
                  if (found) {
                    setSelectedSutra(found);
                    setResultData(null);
                    setAiData(null);
                    setErrorMsg("");
                    setShowTextDetails(false);
                    setShowAllSteps(false);
                    setInputValue(found.default_input || "");
                  }
                }}
              >
                <option value="" disabled>— Select a Sutra / Approximation Technique —</option>
                {sutras.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} [{s.type}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!selectedSutra && (
            <div className={`p-10 rounded-xl border border-dashed text-center space-y-3 ${darkMode ? 'bg-[#151d2e]/60 border-slate-700/70 text-slate-400' : 'bg-slate-50 border-slate-300 text-slate-600'}`}>
              <Sparkles className={`w-8 h-8 mx-auto ${darkMode ? 'text-amber-400/70' : 'text-amber-600'}`} />
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>No Sutra Selected</h3>
                <p className="text-xs leading-relaxed">
                  Select a classical Sanskrit mathematical technique from the dropdown menu above to view its primary verse, run computations, and explore the two-layer explainability breakdown.
                </p>
              </div>
            </div>
          )}

          {selectedSutra && (
            <div className={`print-flow-box p-5 rounded-xl space-y-4 border transition-colors duration-300 ${darkMode ? 'bg-[#172033] border-slate-700/80 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
              <div className="print-atomic p-2 rounded-lg border-none">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-lg md:text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedSutra.name}</h3>
                      {selectedSutra.type === "Static" ? (
                        <span className={`border text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${darkMode ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-purple-100 text-purple-900 border-purple-400'}`}>
                          <Lock className="w-3 h-3" /> Static Constant
                        </span>
                      ) : (
                        <span className={`border text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${darkMode ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-cyan-100 text-cyan-900 border-cyan-400'}`}>
                          <Sliders className="w-3 h-3" /> Dynamic Input
                        </span>
                      )}
                      <span className={`border text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${darkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-900 border-emerald-400'}`}>
                        <CheckCircle className="w-3 h-3" /> Source Cited
                      </span>
                    </div>
                    <p className={`text-sm font-medium leading-relaxed ${darkMode ? 'text-amber-300/95' : 'text-amber-900'}`}>
                      {selectedSutra.one_liner}
                    </p>
                  </div>
                  <span className={`text-xs font-mono px-3 py-1.5 rounded-lg border ${darkMode ? 'bg-[#0f172a] border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-800'}`}>
                    {selectedSutra.author}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1 print-stack">
                <div className="space-y-1.5 print-atomic p-3 rounded-xl">
                  <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${darkMode ? 'text-amber-400' : 'text-amber-900'}`}>
                    <BookOpen className="w-3.5 h-3.5" /> Original Sanskrit Verse (Devanagari)
                  </span>
                  <p className={`text-base font-serif p-3.5 rounded-xl border whitespace-pre-line leading-relaxed ${darkMode ? 'bg-[#0f172a] border-slate-700/80 text-amber-300' : 'bg-amber-50/80 border-amber-300 text-amber-950 font-semibold'}`}>
                    "{selectedSutra.sanskrit}"
                  </p>
                </div>
                <div className="space-y-1.5 print-atomic p-3 rounded-xl">
                  <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-900'}`}>
                    <BookOpen className="w-3.5 h-3.5" /> Roman Transliteration (IAST)
                  </span>
                  <p className={`text-sm font-mono italic p-3.5 rounded-xl border whitespace-pre-line leading-relaxed ${darkMode ? 'bg-[#0f172a] border-emerald-500/30 text-emerald-300' : 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold'}`}>
                    "{selectedSutra.transliteration}"
                  </p>
                </div>
              </div>

              <div className="pt-1 no-print-btn">
                <button
                  onClick={() => setShowTextDetails(!showTextDetails)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${darkMode ? 'bg-[#0f172a] border-slate-700 text-slate-300 hover:bg-slate-800/80' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    {showTextDetails ? "Hide Full Translation, Word Breakdown & Citations" : "Show Full Translation, Word Breakdown & Citations"}
                  </span>
                  {showTextDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              <div className={`${showTextDetails ? 'block' : 'hidden'} print-force-show space-y-4 pt-2`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print-stack">
                  <div className={`print-atomic p-3.5 rounded-xl border text-xs leading-relaxed ${darkMode ? 'bg-[#0f172a] border-amber-500/30 text-amber-200/90' : 'bg-amber-50 border-amber-300 text-amber-950'}`}>
                    <strong className={`block uppercase tracking-wider text-[10px] font-bold mb-1 ${darkMode ? 'text-amber-400' : 'text-amber-900'}`}>📚 Ancient Method Source Citation:</strong>
                    {selectedSutra.source_citation}
                  </div>
                  <div className={`print-atomic p-3.5 rounded-xl border text-xs leading-relaxed ${darkMode ? 'bg-[#0f172a] border-blue-500/30 text-blue-200/90' : 'bg-blue-50 border-blue-300 text-blue-950'}`}>
                    <strong className={`block uppercase tracking-wider text-[10px] font-bold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-900'}`}>🔬 Modern Method Source Citation:</strong>
                    {selectedSutra.modern_citation}
                  </div>
                </div>

                <div className={`print-atomic p-4 rounded-xl border text-xs leading-relaxed whitespace-pre-line ${darkMode ? 'bg-[#0f172a] border-blue-500/30 text-blue-100' : 'bg-blue-50 border-blue-300 text-blue-950'}`}>
                  <strong className={`block text-[11px] uppercase tracking-wider font-bold mb-1.5 ${darkMode ? 'text-blue-400' : 'text-blue-900'}`}>English Sutra Translation:</strong>
                  {selectedSutra.summary}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedSutra.meaning.split('\n').map((line, idx) => (
                    line.trim() && (
                      <div key={idx} className={`print-atomic p-3 rounded-xl border text-xs leading-relaxed ${darkMode ? 'bg-[#0f172a] border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-800'}`}>
                        {line}
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Execution Parameters */}
        {selectedSutra && !isStatic && (
          <section className={`print-atomic p-5 rounded-2xl shadow-lg space-y-3 border transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-amber-400' : 'text-amber-900'}`}>
                <Activity className="w-4 h-4" /> Input Parameter
              </div>
              <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {selectedSutra.input_guideline}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center pt-1">
              <input
                type="number"
                step="any"
                placeholder={`Default: ${selectedSutra.default_input}`}
                className={`w-full rounded-xl px-4 py-2.5 font-mono text-base font-bold outline-none border ${darkMode ? 'bg-[#172033] border-slate-700 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-400 text-slate-900 focus:border-amber-600'}`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                onClick={() => handleCompute(null, null)}
                disabled={loading}
                className="no-print-btn bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-7 py-3 rounded-xl shadow-md transition cursor-pointer shrink-0"
              >
                {loading ? "Computing..." : "⚡ Compute & Explain"}
              </button>
            </div>
            {errorMsg && (
              <div className={`p-3 border rounded-xl text-xs font-bold ${darkMode ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-red-50 border-red-400 text-red-900'}`}>
                ⚠️ {errorMsg}
              </div>
            )}
          </section>
        )}

        {selectedSutra && isStatic && (
          <section className={`print-atomic p-4 rounded-2xl shadow-md border flex items-center justify-between gap-4 ${darkMode ? 'bg-[#111827] border-purple-500/30 text-slate-200' : 'bg-purple-50 border-purple-300 text-purple-950'}`}>
            <div className="flex items-center gap-3 text-xs font-medium">
              <Lock className={`w-4 h-4 shrink-0 ${darkMode ? 'text-purple-400' : 'text-purple-800'}`} />
              <span>{selectedSutra.input_guideline}</span>
            </div>
          </section>
        )}

        {/* Executive Quick-Glance Metrics Banner */}
        {resultData && (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 print-stack">
            <div className={`print-atomic p-4 rounded-2xl border ${darkMode ? 'bg-[#111827] border-amber-500/30' : 'bg-white border-amber-400'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>Ancient Result</span>
              <div className={`text-xl md:text-2xl font-black font-mono mt-1 ${darkMode ? 'text-amber-400' : 'text-amber-900'}`}>{resultData.ancient_computed_result}</div>
            </div>
            <div className={`print-atomic p-4 rounded-2xl border ${darkMode ? 'bg-[#111827] border-blue-500/30' : 'bg-white border-blue-400'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>Modern Ground Truth</span>
              <div className={`text-xl md:text-2xl font-black font-mono mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-900'}`}>{resultData.modern_computed_result}</div>
            </div>
            <div className={`print-atomic p-4 rounded-2xl border ${darkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-300'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${darkMode ? 'text-cyan-400' : 'text-cyan-800'}`}>Absolute Error</span>
              <div className={`text-xl md:text-2xl font-black font-mono mt-1 ${darkMode ? 'text-cyan-400' : 'text-cyan-900'}`}>{resultData.absolute_error}</div>
            </div>
            <div className={`print-atomic p-4 rounded-2xl border ${darkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-300'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${darkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>Precision Agreement</span>
              <div className={`text-xl md:text-2xl font-black font-mono mt-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-900'}`}>{resultData.significant_digits_match} Decimals</div>
            </div>
          </section>
        )}

        {/* Side-by-Side Computation Steps */}
        {resultData && (
          <section className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-stack">
              {/* Ancient Steps */}
              <div className={`print-section p-5 rounded-2xl shadow-lg flex flex-col justify-between space-y-4 border ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
                <div className="space-y-3">
                  <div className={`flex justify-between items-center border-b pb-3 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>Algorithmic Trace</span>
                      <h3 className={`text-base font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Ancient Classical Approach</h3>
                    </div>
                    <span className={`border text-[10px] font-bold px-2.5 py-1 rounded-lg ${darkMode ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-900 border-amber-400'}`}>
                      {resultData.steps_ancient.length} Steps
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {resultData.steps_ancient.map((st, idx) => {
                      const isHiddenOnScreen = !showAllSteps && idx >= STEP_PREVIEW_LIMIT;
                      return (
                        <div key={idx} className={`${isHiddenOnScreen ? 'hidden print-force-show' : 'flex'} print-atomic p-3 rounded-xl items-start gap-3 border ${darkMode ? 'bg-[#172033] border-slate-800/90 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
                          <span className={`font-mono text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-200 text-amber-950'}`}>{st.step}</span>
                          <div className="space-y-1.5 w-full min-w-0">
                            <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{st.theory}</p>
                            <div className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border block overflow-x-auto ${darkMode ? 'text-amber-300 bg-[#0f172a] border-amber-500/25' : 'text-amber-950 bg-amber-100/70 border-amber-300'}`}>
                              {st.math}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modern Steps */}
              <div className={`print-section p-5 rounded-2xl shadow-lg flex flex-col justify-between space-y-4 border ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
                <div className="space-y-3">
                  <div className={`flex justify-between items-center border-b pb-3 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>Numerical Benchmark</span>
                      <h3 className={`text-base font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Modern Computational Approach</h3>
                    </div>
                    <span className={`border text-[10px] font-bold px-2.5 py-1 rounded-lg ${darkMode ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-900 border-blue-400'}`}>
                      {resultData.steps_modern.length} Steps
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {resultData.steps_modern.map((st, idx) => {
                      const isHiddenOnScreen = !showAllSteps && idx >= STEP_PREVIEW_LIMIT;
                      return (
                        <div key={idx} className={`${isHiddenOnScreen ? 'hidden print-force-show' : 'flex'} print-atomic p-3 rounded-xl items-start gap-3 border ${darkMode ? 'bg-[#172033] border-slate-800/90 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
                          <span className={`font-mono text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-200 text-blue-950'}`}>{st.step}</span>
                          <div className="space-y-1.5 w-full min-w-0">
                            <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{st.theory}</p>
                            <div className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border block overflow-x-auto ${darkMode ? 'text-blue-300 bg-[#0f172a] border-blue-500/25' : 'text-blue-950 bg-blue-100/70 border-blue-300'}`}>
                              {st.math}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {(resultData.steps_ancient.length > STEP_PREVIEW_LIMIT || resultData.steps_modern.length > STEP_PREVIEW_LIMIT) && (
              <div className="no-print-btn text-center">
                <button
                  onClick={() => setShowAllSteps(!showAllSteps)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${darkMode ? 'bg-[#111827] border-slate-700 text-amber-400 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'}`}
                >
                  {showAllSteps ? (
                    <>Show Fewer Steps <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Show All Computation Steps ({Math.max(resultData.steps_ancient.length, resultData.steps_modern.length)} steps) <ChevronDown className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            )}
          </section>
        )}

        {/* LAYER 1: Step-by-step explanation (white-box) */}
        {resultData && resultData.xai_rationale && (
          <section className={`print-section p-6 rounded-2xl shadow-lg space-y-5 border ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-amber-400' : 'text-amber-900'}`}>
              <HelpCircle className="w-4 h-4" /> Step-by-step explanation (white-box)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-stack">
              <div className={`print-atomic p-4 rounded-xl border space-y-1.5 ${darkMode ? 'bg-[#172033] border-amber-500/25 text-slate-200' : 'bg-amber-50/70 border-amber-300 text-slate-900'}`}>
                <span className={`text-xs font-bold uppercase block ${darkMode ? 'text-amber-400' : 'text-amber-900'}`}>1. Input Domain & Structure</span>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{resultData.xai_rationale.why_this_input}</p>
              </div>
              <div className={`print-atomic p-4 rounded-xl border space-y-1.5 ${darkMode ? 'bg-[#172033] border-blue-500/25 text-slate-200' : 'bg-blue-50/70 border-blue-300 text-slate-900'}`}>
                <span className={`text-xs font-bold uppercase block ${darkMode ? 'text-blue-400' : 'text-blue-900'}`}>2. Algorithmic Step Rationale</span>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{resultData.xai_rationale.why_these_steps}</p>
              </div>
              <div className={`print-atomic p-4 rounded-xl border space-y-1.5 ${darkMode ? 'bg-[#172033] border-emerald-500/25 text-slate-200' : 'bg-emerald-50/70 border-emerald-300 text-slate-900'}`}>
                <span className={`text-xs font-bold uppercase block ${darkMode ? 'text-emerald-400' : 'text-emerald-900'}`}>3. Error & Truncation Analysis</span>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{resultData.xai_rationale.why_error_size}</p>
              </div>
            </div>

            {resultData.xai_rationale.feature_attributions && (
              <div className={`print-flow-box p-4 rounded-xl border space-y-3 ${darkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-purple-400' : 'text-purple-900'}`}>
                    <BarChart2 className="w-4 h-4" /> Deterministic Term / Place-Value Contribution Breakdown
                  </div>
                  {resultData.xai_rationale.attribution_note && (
                    <p className={`text-[11px] italic ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {resultData.xai_rationale.attribution_note}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {resultData.xai_rationale.feature_attributions.map((attr, idx) => {
                    const pct = attr.contribution_pct ?? attr.importance_pct;
                    return (
                      <div key={idx} className="space-y-1 print-atomic p-2.5 rounded-lg border border-slate-800/60">
                        <div className={`flex justify-between text-xs font-mono font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                          <span className="truncate pr-2">{attr.feature}</span>
                          <span className={`font-bold shrink-0 ${darkMode ? 'text-amber-400' : 'text-amber-900'}`}>+{attr.value} ({pct}%)</span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                          <div
                            className="h-full bg-purple-600"
                            style={{
                              width: `${Math.max(3, Math.min(100, pct))}%`,
                              backgroundColor: darkMode ? '#a855f7' : '#7e22ce'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* LAYER 2: AI explanation of error (SHAP) */}
        {resultData && (
          <section className={`print-section p-6 rounded-2xl shadow-lg space-y-4 border ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-cyan-400' : 'text-cyan-800'}`}>
                <BrainCircuit className="w-4 h-4" /> AI explanation of error (SHAP)
              </div>
              {aiData && aiData.supported && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Cross-Validated R² (GroupKFold) = {aiData.surrogate_r2_cv ?? aiData.surrogate_r2_score}
                  </span>
                  {aiData.training_r2 !== undefined && (
                    <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md border ${darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                      training R² = {aiData.training_r2}
                    </span>
                  )}
                </div>
              )}
            </div>

            {aiData && aiData.supported ? (
              <div className="space-y-4">
                <div className={`print-atomic p-3.5 rounded-xl border text-xs font-medium leading-relaxed ${darkMode ? 'bg-[#0f172a] border-cyan-500/30 text-cyan-200' : 'bg-cyan-50/80 border-cyan-300 text-cyan-950'}`}>
                  🤖 <strong>SHAP Synthesis:</strong> {aiData.explanation}
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs font-mono">
                    <div className={`p-2.5 rounded-lg border ${darkMode ? 'bg-[#172033] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300'}`}>
                      <span className="block text-[10px] text-slate-400">Target θ</span>
                      <strong>{aiData.features.theta}°</strong>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${darkMode ? 'bg-[#172033] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300'}`}>
                      <span className="block text-[10px] text-slate-400">Node Distance</span>
                      <strong>{aiData.features.distance_to_nearest_node}°</strong>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${darkMode ? 'bg-[#172033] border-cyan-500/40 text-cyan-300' : 'bg-cyan-50 border-cyan-300 text-cyan-950'}`}>
                      <span className="block text-[10px] opacity-80">Surrogate estimate</span>
                      <strong>{aiData.predicted_error.toExponential(3)}</strong>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${darkMode ? 'bg-[#172033] border-amber-500/40 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-950'}`}>
                      <span className="block text-[10px] opacity-80">Actual error</span>
                      <strong>{aiData.true_error.toExponential(3)}</strong>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${darkMode ? 'bg-[#172033] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300'}`}>
                      <span className="block text-[10px] text-slate-400">Base Value E[f(x)]</span>
                      <strong>{aiData.base_value.toExponential(3)}</strong>
                    </div>
                  </div>
                  <p className={`text-[11px] italic ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Note: The surrogate is a coarse model and its estimate can differ from the actual error.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <span className={`text-xs font-bold uppercase tracking-wider block ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Feature SHAP Contributions (Relative Impact on Surrogate Error Estimate)
                  </span>
                  {(() => {
                    const shapEntries = Object.entries(aiData.shap_values || {});
                    const maxAbsShap = Math.max(...shapEntries.map(([, v]) => Math.abs(v)), 1e-12);
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {shapEntries.map(([featName, sVal]) => {
                          const isPositive = sVal >= 0;
                          const relWidth = Math.min(100, Math.max(4, (Math.abs(sVal) / maxAbsShap) * 100));
                          return (
                            <div key={featName} className={`p-2.5 rounded-lg border space-y-1 ${darkMode ? 'bg-[#172033] border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
                              <div className="flex justify-between text-xs font-mono">
                                <span>{featName}</span>
                                <span className={isPositive ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                                  {isPositive ? `+${sVal.toExponential(3)}` : sVal.toExponential(3)}
                                </span>
                              </div>
                              <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                <div
                                  className={`h-full ${isPositive ? 'bg-red-500' : 'bg-emerald-500'}`}
                                  style={{
                                    width: `${relWidth}%`,
                                    backgroundColor: isPositive ? '#ef4444' : '#10b981'
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-xl border text-xs font-medium ${darkMode ? 'bg-[#172033] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-300 text-slate-600'}`}>
                ℹ️ {aiData
                  ? (aiData.reason === "not_applicable" || (aiData.message && aiData.message.includes("not applicable"))
                      ? "Constant/fixed-error technique: step-by-step explanation applies. (AI error model not applicable: error is constant/fixed)"
                      : "AI explanation unavailable for this input")
                  : "Loading AI error analysis..."}
              </div>
            )}
          </section>
        )}

        {/* Mathematical Error Verification Formulas */}
        {resultData && resultData.error_formulas && (
          <section className={`print-section p-6 rounded-2xl shadow-lg space-y-4 border ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-emerald-400' : 'text-emerald-900'}`}>
              <Award className="w-4 h-4" /> Mathematical Error & Precision Formulas
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-stack">
              <div className={`print-atomic p-3.5 rounded-xl border space-y-1.5 ${darkMode ? 'bg-[#172033] border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
                <span className={`text-[11px] font-bold uppercase block ${darkMode ? 'text-amber-400' : 'text-amber-900'}`}>1. Absolute Error Formula</span>
                <p className={`text-[11px] font-mono break-all ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{resultData.error_formulas.abs_formula}</p>
              </div>
              <div className={`print-atomic p-3.5 rounded-xl border space-y-1.5 ${darkMode ? 'bg-[#172033] border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
                <span className={`text-[11px] font-bold uppercase block ${darkMode ? 'text-cyan-400' : 'text-cyan-900'}`}>2. Relative Error Formula</span>
                <p className={`text-[11px] font-mono break-all ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{resultData.error_formulas.rel_formula}</p>
              </div>
              <div className={`print-atomic p-3.5 rounded-xl border space-y-1.5 ${darkMode ? 'bg-[#172033] border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
                <span className={`text-[11px] font-bold uppercase block ${darkMode ? 'text-emerald-400' : 'text-emerald-900'}`}>3. Decimal Agreement</span>
                <p className={`text-[11px] font-mono break-all ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{resultData.error_formulas.precision_formula}</p>
              </div>
            </div>
          </section>
        )}

        {/* Chart 1: Value Progression / Rsine Values at Table Nodes */}
        {resultData && resultData.graph_data && (
          <section className={`print-atomic p-6 rounded-2xl shadow-lg space-y-4 border ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {resultData.graph_data.chart_kind === "table_nodes"
                    ? "Rsine values at table nodes"
                    : `Step-by-Step Value Progression & Convergence (${resultData.graph_data.chart_kind || "comparison"})`}
                </h3>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {resultData.graph_data.chart_kind === "table_nodes"
                    ? `Displays normalized Āryabhaṭa Rsine values across successive 3°45′ table nodes up to θ = ${resultData.input_value}°, alongside the true sin(θ) at the same node angles.`
                    : `Compares ${resultData.graph_data.ancient_label || "Ancient progression"} against ${resultData.graph_data.modern_label || "Modern progression"}.`}
                </p>
              </div>
              <span className={`border text-xs font-bold px-3 py-1 rounded-xl ${darkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-950 border-emerald-400'}`}>
                Accuracy: {resultData.accuracy_percent}%
              </span>
            </div>

            <div className={`p-4 rounded-xl space-y-4 border ${darkMode ? 'bg-[#121824] border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
              <div className="flex flex-col gap-1.5 text-xs font-bold pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-2.5 rounded-xs inline-block shrink-0" style={{ backgroundColor: darkMode ? '#a855f7' : '#7e22ce' }}></span>
                  <span className={`break-all ${darkMode ? 'text-purple-300' : 'text-purple-950'}`}>
                    {resultData.graph_data.ancient_label || "Ancient Trajectory"}: ({resultData.graph_data.ancient_curve.join(" → ")})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-2.5 rounded-xs inline-block shrink-0" style={{ backgroundColor: darkMode ? '#06b6d4' : '#0891b2' }}></span>
                  <span className={`break-all ${darkMode ? 'text-cyan-300' : 'text-cyan-950'}`}>
                    {resultData.graph_data.modern_label || "Modern Trajectory"}: ({resultData.graph_data.modern_curve.join(" → ")})
                  </span>
                </div>
                {resultData.graph_data.reference_lines && Object.entries(resultData.graph_data.reference_lines).map(([refName, refVal]) => (
                  <div key={refName} className="flex items-center gap-2">
                    <span className="w-3.5 h-0.5 border-b-2 border-dashed border-amber-500 inline-block shrink-0"></span>
                    <span className={darkMode ? 'text-amber-400' : 'text-amber-800'}>
                      Reference Line — {refName}: {refVal}
                    </span>
                  </div>
                ))}
              </div>

              <div className={`print-graph-box relative w-full h-80 border rounded-lg p-4 pb-10 flex flex-col justify-between ${darkMode ? 'bg-[#0d131f] border-slate-800' : 'bg-white border-slate-300'}`}>
                <svg className="print-svg w-full h-full overflow-visible" width="100%" height="200" viewBox="0 0 600 220" preserveAspectRatio="none">
                  <line x1="40" y1="20" x2="580" y2="20" stroke={darkMode ? "#334155" : "#cbd5e1"} strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="40" y1="65" x2="580" y2="65" stroke={darkMode ? "#334155" : "#cbd5e1"} strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="40" y1="110" x2="580" y2="110" stroke={darkMode ? "#334155" : "#cbd5e1"} strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="40" y1="155" x2="580" y2="155" stroke={darkMode ? "#334155" : "#cbd5e1"} strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="40" y1="200" x2="580" y2="200" stroke="#475569" strokeWidth="1.5" />

                  {(() => {
                    const anc = resultData.graph_data.ancient_curve;
                    const mod = resultData.graph_data.modern_curve;
                    const refVals = resultData.graph_data.reference_lines ? Object.values(resultData.graph_data.reference_lines) : [];
                    const allVals = [...anc, ...mod, ...refVals];
                    const rawMin = Math.min(...allVals);
                    const rawMax = Math.max(...allVals);
                    const pad = (rawMax - rawMin) * 0.12 || Math.abs(rawMax) * 0.02 || 1;
                    const minV = rawMin - pad;
                    const maxV = rawMax + pad;
                    const range = maxV - minV || 1;
                    const count = Math.max(anc.length - 1, 1);

                    const getCoordinates = (arr) => {
                      return arr.map((val, idx) => {
                        const x = 60 + (idx / count) * 480;
                        const y = 200 - ((val - minV) / range) * 160;
                        return { x, y, val };
                      });
                    };

                    const ancPts = getCoordinates(anc);
                    const modPts = getCoordinates(mod);
                    const ancColor = darkMode ? "#c084fc" : "#7e22ce";
                    const modColor = darkMode ? "#22d3ee" : "#0891b2";
                    const axisTextColor = darkMode ? "#cbd5e1" : "#1e293b";

                    return (
                      <>
                        <text x="5" y="25" fill={axisTextColor} fontSize="9.5" fontWeight="bold" fontFamily="monospace">{maxV.toFixed(4)}</text>
                        <text x="5" y="200" fill={axisTextColor} fontSize="9.5" fontWeight="bold" fontFamily="monospace">{minV.toFixed(4)}</text>

                        {resultData.graph_data.reference_lines && Object.entries(resultData.graph_data.reference_lines).map(([refName, refVal]) => {
                          const refY = 200 - ((refVal - minV) / range) * 160;
                          return (
                            <g key={refName}>
                              <line x1="40" y1={refY} x2="580" y2={refY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" />
                              <text x="480" y={refY - 5} fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">
                                {refName} ({refVal})
                              </text>
                            </g>
                          );
                        })}

                        <polyline
                          points={modPts.map(p => `${p.x},${p.y}`).join(' ')}
                          fill="none"
                          stroke={modColor}
                          strokeWidth="3"
                        />
                        <polyline
                          points={ancPts.map(p => `${p.x},${p.y}`).join(' ')}
                          fill="none"
                          stroke={ancColor}
                          strokeWidth="3"
                        />
                        {modPts.map((pt, i) => (
                          <g key={`mod-${i}`}>
                            <circle cx={pt.x} cy={pt.y} r="4.5" fill={modColor} />
                            <text x={pt.x - 16} y={pt.y + 15} fill={modColor} fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                              {pt.val}
                            </text>
                          </g>
                        ))}
                        {ancPts.map((pt, i) => (
                          <g key={`anc-${i}`}>
                            <circle cx={pt.x} cy={pt.y} r="4.5" fill={ancColor} />
                            <text x={pt.x - 16} y={pt.y - 8} fill={ancColor} fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                              {pt.val}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>

                <div className={`flex justify-between px-6 text-[10px] font-mono font-bold pt-2 border-t mt-1 overflow-x-auto ${darkMode ? 'text-slate-300 border-slate-700/60' : 'text-slate-800 border-slate-300'}`}>
                  {resultData.graph_data.iterations.map((lbl, idx) => (
                    <span key={idx}>{lbl}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Chart 2: Error per Step on Log10 Scale (Hidden when chart_kind === "table_nodes") */}
        {resultData && resultData.graph_data && resultData.graph_data.chart_kind !== "table_nodes" && (
          <section className={`print-atomic p-6 rounded-2xl shadow-lg space-y-4 border ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}>
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Error per Step on Logarithmic Scale — log₁₀(|Estimate − Ground Truth|)
                </h3>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Tracks how rapidly each step's absolute error decays toward zero (lower is more accurate; floor at 10⁻¹² for exact match).
                </p>
              </div>
            </div>

            {(() => {
              const target = resultData.modern_computed_result;
              const EPS = 1e-12;
              const ancErrs = resultData.graph_data.ancient_curve.map(v => Math.max(Math.abs(v - target), EPS));
              const modErrs = resultData.graph_data.modern_curve.map(v => Math.max(Math.abs(v - target), EPS));
              const ancLogs = ancErrs.map(e => Math.log10(e));
              const modLogs = modErrs.map(e => Math.log10(e));

              const allLogs = [...ancLogs, ...modLogs];
              const minLog = Math.min(...allLogs) - 0.5;
              const maxLog = Math.max(...allLogs) + 0.5;
              const logRange = (maxLog - minLog) || 1;
              const count = Math.max(ancLogs.length - 1, 1);

              const getLogCoords = (logArr, rawErrArr) => {
                return logArr.map((lVal, idx) => {
                  const x = 60 + (idx / count) * 480;
                  const y = 200 - ((lVal - minLog) / logRange) * 160;
                  return { x, y, logVal: lVal, errVal: rawErrArr[idx] };
                });
              };

              const ancLogPts = getLogCoords(ancLogs, ancErrs);
              const modLogPts = getLogCoords(modLogs, modErrs);
              const ancColor = darkMode ? "#c084fc" : "#7e22ce";
              const modColor = darkMode ? "#22d3ee" : "#0891b2";
              const axisTextColor = darkMode ? "#cbd5e1" : "#1e293b";

              return (
                <div className={`p-4 rounded-xl space-y-4 border ${darkMode ? 'bg-[#121824] border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
                  <div className="flex flex-col gap-1.5 text-xs font-bold pb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-2.5 rounded-xs inline-block shrink-0" style={{ backgroundColor: darkMode ? '#a855f7' : '#7e22ce' }}></span>
                      <span className={`break-all ${darkMode ? 'text-purple-300' : 'text-purple-950'}`}>
                        Ancient |Error| per Step: ({ancErrs.map(e => e <= EPS ? "0 (≤1e-12)" : e.toExponential(2)).join(" → ")})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-2.5 rounded-xs inline-block shrink-0" style={{ backgroundColor: darkMode ? '#06b6d4' : '#0891b2' }}></span>
                      <span className={`break-all ${darkMode ? 'text-cyan-300' : 'text-cyan-950'}`}>
                        Modern |Error| per Step: ({modErrs.map(e => e <= EPS ? "0 (≤1e-12)" : e.toExponential(2)).join(" → ")})
                      </span>
                    </div>
                  </div>

                  <div className={`print-graph-box relative w-full h-80 border rounded-lg p-4 pb-10 flex flex-col justify-between ${darkMode ? 'bg-[#0d131f] border-slate-800' : 'bg-white border-slate-300'}`}>
                    <svg className="print-svg w-full h-full overflow-visible" width="100%" height="200" viewBox="0 0 600 220" preserveAspectRatio="none">
                      <line x1="40" y1="20" x2="580" y2="20" stroke={darkMode ? "#334155" : "#cbd5e1"} strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="40" y1="65" x2="580" y2="65" stroke={darkMode ? "#334155" : "#cbd5e1"} strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="40" y1="110" x2="580" y2="110" stroke={darkMode ? "#334155" : "#cbd5e1"} strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="40" y1="155" x2="580" y2="155" stroke={darkMode ? "#334155" : "#cbd5e1"} strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="40" y1="200" x2="580" y2="200" stroke="#475569" strokeWidth="1.5" />

                      <text x="2" y="25" fill={axisTextColor} fontSize="9" fontWeight="bold" fontFamily="monospace">10^{maxLog.toFixed(1)}</text>
                      <text x="2" y="200" fill={axisTextColor} fontSize="9" fontWeight="bold" fontFamily="monospace">10^{minLog.toFixed(1)}</text>

                      <polyline
                        points={modLogPts.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke={modColor}
                        strokeWidth="2.5"
                      />
                      <polyline
                        points={ancLogPts.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke={ancColor}
                        strokeWidth="2.5"
                      />
                      {modLogPts.map((pt, i) => (
                        <g key={`mod-log-${i}`}>
                          <circle cx={pt.x} cy={pt.y} r="4" fill={modColor} />
                          <text x={pt.x - 16} y={pt.y + 14} fill={modColor} fontSize="8" fontWeight="bold" fontFamily="monospace">
                            {pt.errVal <= EPS ? "0" : pt.errVal.toExponential(1)}
                          </text>
                        </g>
                      ))}
                      {ancLogPts.map((pt, i) => (
                        <g key={`anc-log-${i}`}>
                          <circle cx={pt.x} cy={pt.y} r="4" fill={ancColor} />
                          <text x={pt.x - 16} y={pt.y - 8} fill={ancColor} fontSize="8" fontWeight="bold" fontFamily="monospace">
                            {pt.errVal <= EPS ? "0" : pt.errVal.toExponential(1)}
                          </text>
                        </g>
                      ))}
                    </svg>

                    <div className={`flex justify-between px-6 text-[10px] font-mono font-bold pt-2 border-t mt-1 overflow-x-auto ${darkMode ? 'text-slate-300 border-slate-700/60' : 'text-slate-800 border-slate-300'}`}>
                      {resultData.graph_data.iterations.map((lbl, idx) => (
                        <span key={idx}>{lbl}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </section>
        )}
      </div>
    </div>
  );
}