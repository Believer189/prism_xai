// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Cpu, BookOpen, Layers, Terminal, Award, FileText, Activity, Sun, Moon } from 'lucide-react';

export default function App() {
  const [sutras, setSutras] = useState([]);
  const [selectedSutra, setSelectedSutra] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/sutras")
      .then(res => res.json())
      .then(data => setSutras(data))
      .catch(err => console.error("Error fetching sutras:", err));
  }, []);

  const handleCompute = (customVal = null) => {
    if (!selectedSutra) return;
    setLoading(true);
    setErrorMsg("");
    
    let val = 0.0;
    if (customVal !== null) {
      val = parseFloat(customVal);
    } else if (inputValue !== "") {
      val = parseFloat(inputValue);
    } else {
      val = selectedSutra.id === "madhava_pi" ? 30 : selectedSutra.id === "nilakantha_pi" ? 15 : 125.0;
    }
    
    fetch("http://localhost:8000/api/compute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method_id: selectedSutra.id, input_value: val })
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
        setErrorMsg(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedSutra) {
      setResultData(null);
      setInputValue("");
      setErrorMsg("");
      if (selectedSutra.type === "Static") {
        setTimeout(() => handleCompute(0), 50);
      }
    }
  }, [selectedSutra]);

  const isStatic = selectedSutra?.type === "Static";

  return (
    <div className={`min-h-screen font-sans p-4 md:p-8 space-y-6 transition-colors duration-300 ${darkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-white text-black'}`}>
      
      {/* Header */}
      <header className={`flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-2xl shadow-xl gap-4 border transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-black'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 border rounded-xl ${darkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-amber-100 border-amber-300 text-amber-700'}`}>
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider">PRISM</h1>
            <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Explainable AI Framework for Ancient Indian Mathematical Approximation Techniques</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border transition cursor-pointer ${darkMode ? 'bg-[#1f2937] border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'}`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition cursor-pointer"
          >
            <FileText className="w-4 h-4" /> Export XAI Report
          </button>
        </div>
      </header>

      {/* Sutra Selector */}
      <section className={`p-6 rounded-2xl shadow-xl space-y-6 border transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-black'}`}>
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 ${darkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
          <div>
            <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Terminal className="w-4 h-4" /> Vedic Computational Engine (15 Verified Sutras)
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Select Approximation Sutra / Method</h2>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Choose from authentic Sanskrit algorithms (Dynamic & Static).</p>
          </div>
          <div className="w-full md:w-96">
            <select
              className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border cursor-pointer transition-colors duration-300 ${darkMode ? 'bg-[#1f2937] border-slate-700 text-slate-200 focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-black focus:border-amber-500'}`}
              value={selectedSutra ? selectedSutra.id : ""}
              onChange={(e) => {
                const found = sutras.find(s => s.id === e.target.value);
                if (found) setSelectedSutra(found);
              }}
            >
              <option value="" disabled>-- Select a Sutra / Method --</option>
              {sutras.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} [{s.type}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedSutra ? (
          <div className={`p-6 rounded-xl space-y-4 border transition-colors duration-300 ${darkMode ? 'bg-[#172033] border-slate-700/60 text-slate-100' : 'bg-slate-50 border-slate-300 text-black'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold">{selectedSutra.name}</h3>
                <span className={`border text-[10px] font-bold px-2.5 py-0.5 rounded-full ${selectedSutra.type === 'Static' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                  {selectedSutra.type} Technique
                </span>
              </div>
              <span className={`text-xs font-mono ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Author: <strong className={darkMode ? 'text-slate-200' : 'text-black'}>{selectedSutra.author}</strong></span>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Authentic Sanskrit Verse (Exact Multiline Format)
              </span>
              <p className={`text-lg font-serif p-4 rounded-xl border whitespace-pre-line leading-relaxed transition-colors duration-300 ${darkMode ? 'bg-[#0f172a] border-slate-700 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                "{selectedSutra.sanskrit}"
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Word-by-Word Meaning & Formula Breakdown
              </span>
              
              <div className={`p-4 rounded-xl border text-sm font-medium leading-relaxed transition-colors duration-300 ${darkMode ? 'bg-[#0f172a] border-blue-500/30 text-blue-200' : 'bg-blue-100/70 border-blue-300 text-blue-950'}`}>
                <strong className="block text-xs uppercase tracking-wider text-blue-400 mb-1">Full Summarized Meaning:</strong>
                {selectedSutra.summary}
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block pt-2">Word-by-Word Explanation:</span>
              <div className="space-y-2">
                {selectedSutra.meaning.split('\n').map((line, idx) => {
                  if (!line.trim()) return null;
                  return (
                    <div key={idx} className={`p-3.5 rounded-xl border text-sm leading-relaxed transition-colors duration-300 ${darkMode ? 'bg-[#0f172a] border-slate-700/80 text-slate-200' : 'bg-blue-50/70 border-blue-200 text-blue-950'}`}>
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-sm italic">
            Please select an approximation sutra from the dropdown above to inspect its authentic Sanskrit verse and derivation details.
          </div>
        )}
      </section>

      {/* Input Parameters (Visible only for Dynamic Sutras) */}
      {selectedSutra && !isStatic && (
        <section className={`p-6 rounded-2xl shadow-xl space-y-4 border transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-black'}`}>
          <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4" /> Execution Parameters
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-amber-500 text-xs leading-relaxed">
            ⚠️ {selectedSutra?.input_guideline}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
            <div className="w-full">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Enter Parameter Value</label>
              <input
                type="number"
                placeholder="Enter value..."
                className={`w-full rounded-xl px-4 py-3 font-mono text-lg outline-none border transition-colors duration-300 ${darkMode ? 'bg-[#172033] border-slate-700 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-black focus:border-amber-500'}`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <button
              onClick={() => handleCompute(null)}
              disabled={loading}
              className="w-full sm:w-auto mt-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "Processing..." : "⚡ Compute & Explain"}
            </button>
          </div>
          {errorMsg && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}
        </section>
      )}

      {/* Comparison Columns */}
      {resultData && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-6 border transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-black'}`}>
            <div className="space-y-4">
              <div className={`flex justify-between items-center border-b pb-4 ${darkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
                <div>
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Step-by-step mathematical derivation</span>
                  <h3 className="text-lg font-black">Ancient Classical / Vedic Approach</h3>
                </div>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg">Ancient Method</span>
              </div>
              <div className="space-y-3">
                {resultData.steps_ancient.map((st, idx) => (
                  <div key={idx} className={`p-4 rounded-xl flex items-start gap-3 border transition-colors duration-300 ${darkMode ? 'bg-[#172033] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
                    <span className="bg-amber-500/20 text-amber-500 font-mono text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">{st.step}</span>
                    <div className="space-y-2 w-full">
                      <p className="text-sm font-medium leading-relaxed">{st.theory}</p>
                      <div className="text-sm font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 inline-block">
                        {st.math}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-4 rounded-xl mt-4 border border-amber-500/30 ${darkMode ? 'bg-[#172033]' : 'bg-amber-50'}`}>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1">Ancient Computed Result</span>
              <div className="text-2xl font-black font-mono text-amber-500">{resultData.ancient_computed_result}</div>
            </div>
          </div>

          <div className={`p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-6 border transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-black'}`}>
            <div className="space-y-4">
              <div className={`flex justify-between items-center border-b pb-4 ${darkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Standard floating-point algorithm</span>
                  <h3 className="text-lg font-black">Modern Computational Approach</h3>
                </div>
                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg">IEEE 754 Standard</span>
              </div>
              <div className="space-y-3">
                {resultData.steps_modern.map((st, idx) => (
                  <div key={idx} className={`p-4 rounded-xl flex items-start gap-3 border transition-colors duration-300 ${darkMode ? 'bg-[#172033] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
                    <span className="bg-blue-500/20 text-blue-400 font-mono text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">{st.step}</span>
                    <div className="space-y-2 w-full">
                      <p className="text-sm font-medium leading-relaxed">{st.theory}</p>
                      <div className="text-sm font-mono font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 inline-block">
                        {st.math}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-4 rounded-xl mt-4 border border-blue-500/30 ${darkMode ? 'bg-[#172033]' : 'bg-blue-50'}`}>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">Modern Computed Result / Ground Truth</span>
              <div className="text-2xl font-black font-mono text-blue-400">{resultData.modern_computed_result}</div>
            </div>
          </div>
        </section>
      )}

      {/* XAI Rationale */}
      {resultData && resultData.xai_rationale && (
        <section className={`p-6 rounded-2xl shadow-xl space-y-4 border transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-black'}`}>
          <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" /> Explainable AI (XAI) Rationale & Feature Attribution
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className={`p-4 rounded-xl space-y-2 border ${darkMode ? 'bg-[#172033] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
              <span className="text-[11px] font-bold text-amber-500 uppercase">🟡 Input Rationale</span>
              <p className="text-sm leading-relaxed">{resultData.xai_rationale.input_rationale}</p>
            </div>
            <div className={`p-4 rounded-xl space-y-2 border ${darkMode ? 'bg-[#172033] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
              <span className="text-[11px] font-bold text-blue-400 uppercase">⚡ Ancient Heuristic Logic</span>
              <p className="text-sm leading-relaxed">{resultData.xai_rationale.ancient_logic}</p>
            </div>
            <div className={`p-4 rounded-xl space-y-2 border ${darkMode ? 'bg-[#172033] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
              <span className="text-[11px] font-bold text-emerald-400 uppercase">📈 Error & Convergence Analysis</span>
              <p className="text-sm leading-relaxed">{resultData.xai_rationale.convergence_analysis}</p>
            </div>
          </div>
        </section>
      )}

      {/* Convergence Graph */}
      {resultData && resultData.graph_data && (
        <section className={`p-6 rounded-2xl shadow-xl space-y-4 border transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-black'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">Accuracy & Convergence Comparison Graph</h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Iteration progression toward modern hardware benchmarks.</p>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-xl">
              Accuracy: {resultData.accuracy_percent}%
            </span>
          </div>

          <div className={`p-6 rounded-xl space-y-4 border ${darkMode ? 'bg-[#121824] border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
            <div className="flex items-center gap-6 text-xs font-semibold pb-2">
              <div className="flex items-center gap-2">
                <span className="w-4 h-2 bg-purple-500 rounded-xs inline-block"></span> 
                <span className="text-purple-400">Ancient Vedic Approximation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-2 bg-cyan-500 rounded-xs inline-block"></span> 
                <span className="text-cyan-500">Modern Computational Ground Truth</span>
              </div>
            </div>

            <div className={`relative w-full h-80 border rounded-lg p-4 pb-10 flex flex-col justify-between overflow-hidden ${darkMode ? 'bg-[#0d131f] border-slate-800' : 'bg-white border-slate-300'}`}>
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 220">
                <line x1="40" y1="20" x2="580" y2="20" stroke={darkMode ? "#1e293b" : "#cbd5e1"} strokeDasharray="4 4" />
                <line x1="40" y1="65" x2="580" y2="65" stroke={darkMode ? "#1e293b" : "#cbd5e1"} strokeDasharray="4 4" />
                <line x1="40" y1="110" x2="580" y2="110" stroke={darkMode ? "#1e293b" : "#cbd5e1"} strokeDasharray="4 4" />
                <line x1="40" y1="155" x2="580" y2="155" stroke={darkMode ? "#1e293b" : "#cbd5e1"} strokeDasharray="4 4" />
                <line x1="40" y1="200" x2="580" y2="200" stroke={darkMode ? "#334155" : "#94a3b8"} strokeWidth="1" />

                {(() => {
                  const anc = resultData.graph_data.ancient_curve;
                  const mod = resultData.graph_data.modern_curve;
                  const minV = Math.min(...anc, ...mod) * 0.98;
                  const maxV = Math.max(...anc, ...mod) * 1.02;
                  const range = maxV - minV || 1;

                  const getCoordinates = (arr) => {
                    return arr.map((val, idx) => {
                      const x = 80 + idx * 120;
                      const y = 200 - ((val - minV) / range) * 160;
                      return `${x},${y}`;
                    });
                  };

                  const ancPts = getCoordinates(anc);
                  const modPts = getCoordinates(mod);

                  return (
                    <>
                      <polyline points={modPts.join(' ')} fill="none" stroke="#06b6d4" strokeWidth="2.5" />
                      <polyline points={ancPts.join(' ')} fill="none" stroke="#a855f7" strokeWidth="2.5" />
                      {modPts.map((pt, i) => {
                        const [cx, cy] = pt.split(',');
                        return <circle key={`mod-${i}`} cx={cx} cy={cy} r="4" fill="#06b6d4" />;
                      })}
                      {ancPts.map((pt, i) => {
                        const [cx, cy] = pt.split(',');
                        return <circle key={`anc-${i}`} cx={cx} cy={cy} r="4" fill="#a855f7" />;
                      })}
                    </>
                  );
                })()}
              </svg>

              <div className="flex justify-between px-6 text-xs font-mono text-slate-400 pt-3 border-t border-slate-700/60 mt-2">
                <span>Iter 1 (Start)</span>
                <span>Iter 2</span>
                <span>Iter 3</span>
                <span>Iter 4</span>
                <span>Iter 5 (Final)</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}