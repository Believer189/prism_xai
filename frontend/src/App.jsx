// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Cpu, BookOpen, Layers, Terminal, Award, FileText, Activity, Sun, Moon } from 'lucide-react';

function App() {
  const [sutras, setSutras] = useState([]);
  const [selectedSutra, setSelectedSutra] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/sutras")
      .then(res => res.json())
      .then(data => {
        setSutras(data);
        // Default selectedSutra is left null until user selects one
      })
      .catch(err => console.error("Error fetching sutras:", err));
  }, []);

  const handleCompute = () => {
    if (!selectedSutra) return;
    setLoading(true);
    const val = inputValue === "" ? 125 : parseFloat(inputValue);
    fetch("http://localhost:8000/api/compute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method_id: selectedSutra.id, input_value: val })
    })
      .then(res => res.json())
      .then(data => {
        setResultData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Computation error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedSutra) {
      if (selectedSutra.type.includes("Static")) {
        handleCompute();
      } else {
        setResultData(null);
        setInputValue("");
      }
    }
  }, [selectedSutra]);

  const handleExportPDF = () => {
    window.print();
  };

  const isStatic = selectedSutra?.type?.includes("Static");

  return (
    <div className={`min-h-screen font-sans p-4 md:p-8 space-y-6 transition-colors duration-300 ${darkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-white text-black'}`}>
      
      {/* Top Header */}
      <header className={`flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-2xl shadow-xl gap-4 border transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-black shadow-sm'}`}>
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
            onClick={handleExportPDF} 
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition cursor-pointer"
          >
            <FileText className="w-4 h-4" /> Export XAI Report
          </button>
        </div>
      </header>

      {/* Sutra Selection Section */}
      <section className={`p-6 rounded-2xl shadow-xl space-y-6 border transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-black shadow-sm'}`}>
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 ${darkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
          <div>
            <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Terminal className="w-4 h-4" /> Vedic Computational Engine
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Select Approximation Sutra / Method</h2>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Choose from all 15 classical Vedic and ancient Indian mathematical approximation algorithms.</p>
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
                  {s.name} ({s.type.split(" ")[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sutra Metadata Card (Only shows once selected) */}
        {selectedSutra ? (
          <div className={`p-6 rounded-xl space-y-4 border transition-colors duration-300 ${darkMode ? 'bg-[#172033] border-slate-700/60 text-slate-100' : 'bg-slate-50 border-slate-300 text-black'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold">{selectedSutra.name}</h3>
                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {selectedSutra.type}
                </span>
              </div>
              <span className={`text-xs font-mono ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Origin Author / Text: <strong className={darkMode ? 'text-slate-200' : 'text-black'}>{selectedSutra.author}</strong></span>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Original Sanskrit Verse / Sutra (Dvipada Format)
              </span>
              <p className={`text-lg font-serif p-4 rounded-xl border whitespace-pre-line leading-relaxed transition-colors duration-300 ${darkMode ? 'bg-[#0f172a] border-slate-700 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                "{selectedSutra.sanskrit}"
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Term-by-Term English Breakdown & Meaning
              </span>
              <p className={`text-sm leading-relaxed p-4 rounded-xl border transition-colors duration-300 ${darkMode ? 'bg-[#0f172a] border-slate-700 text-slate-200' : 'bg-blue-50 border-blue-200 text-blue-950'}`}>
                {selectedSutra.meaning}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-sm italic">
            Please select an approximation sutra from the dropdown above to inspect its algorithmic and Sanskrit details.
          </div>
        )}
      </section>

      {/* Input Guidelines & Execution Parameters */}
      {selectedSutra && !isStatic && (
        <section className={`p-6 rounded-2xl shadow-xl space-y-4 border transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-black shadow-sm'}`}>
          <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4" /> Input Guidelines & Execution Parameters
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-amber-500 text-xs leading-relaxed">
            ⚠️ {selectedSutra?.input_guideline}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
            <div className="w-full">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Enter Number / Value</label>
              <input
                type="number"
                placeholder="Enter custom input value..."
                className={`w-full rounded-xl px-4 py-3 font-mono text-lg outline-none border transition-colors duration-300 ${darkMode ? 'bg-[#172033] border-slate-700 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-300 text-black focus:border-amber-500'}`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <button
              onClick={handleCompute}
              disabled={loading}
              className="w-full sm:w-auto mt-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "Processing..." : "⚡ Compute & Explain"}
            </button>
          </div>
        </section>
      )}

      {/* Side-by-Side Comparison Columns */}
      {resultData && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Ancient Vedic Approach */}
          <div className={`p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-6 border transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-black shadow-sm'}`}>
            <div className="space-y-4">
              <div className={`flex justify-between items-center border-b pb-4 ${darkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
                <div>
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Step-by-step heuristic derivation</span>
                  <h3 className="text-lg font-black">Ancient Vedic / Classical Approach</h3>
                </div>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg">Ancient Method</span>
              </div>
              <div className="space-y-3">
                {resultData.steps_ancient.map((st, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl flex items-start gap-3 border transition-colors duration-300 ${darkMode ? 'bg-[#172033] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
                    <span className="bg-amber-500/20 text-amber-500 font-mono text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">{st.step}</span>
                    <p className="text-xs leading-relaxed">{st.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-4 rounded-xl mt-4 border border-amber-500/30 ${darkMode ? 'bg-[#172033]' : 'bg-amber-50'}`}>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1">Ancient Computed Result</span>
              <div className="text-2xl font-black font-mono text-amber-500">{resultData.ancient_computed_result}</div>
            </div>
          </div>

          {/* Right Column: Modern Computational Approach */}
          <div className={`p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-6 border transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-black shadow-sm'}`}>
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
                  <div key={idx} className={`p-3.5 rounded-xl flex items-start gap-3 border transition-colors duration-300 ${darkMode ? 'bg-[#172033] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
                    <span className="bg-blue-500/20 text-blue-400 font-mono text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">{st.step}</span>
                    <p className="text-xs leading-relaxed">{st.description}</p>
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

      {/* Explainable AI (XAI) Rationale */}
      {resultData && resultData.xai_rationale && (
        <section className={`p-6 rounded-2xl shadow-xl space-y-4 border transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-black shadow-sm'}`}>
          <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" /> Explainable AI (XAI) Rationale & Feature Attribution
          </div>
          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Deep inspection of why this input and approximation path were chosen.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className={`p-4 rounded-xl space-y-2 border ${darkMode ? 'bg-[#172033] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
              <span className="text-[11px] font-bold text-amber-500 uppercase">🟡 Input Rationale</span>
              <p className="text-xs leading-relaxed">{resultData.xai_rationale.input_rationale}</p>
            </div>
            <div className={`p-4 rounded-xl space-y-2 border ${darkMode ? 'bg-[#172033] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
              <span className="text-[11px] font-bold text-blue-400 uppercase">⚡ Ancient Heuristic Logic</span>
              <p className="text-xs leading-relaxed">{resultData.xai_rationale.ancient_logic}</p>
            </div>
            <div className={`p-4 rounded-xl space-y-2 border ${darkMode ? 'bg-[#172033] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
              <span className="text-[11px] font-bold text-emerald-400 uppercase">📈 Error & Convergence Analysis</span>
              <p className="text-xs leading-relaxed">{resultData.xai_rationale.convergence_analysis}</p>
            </div>
          </div>
        </section>
      )}

      {/* Accuracy & Convergence Comparison Graph */}
      {resultData && resultData.graph_data && (
        <section className={`p-6 rounded-2xl shadow-xl space-y-4 border break-inside-avoid transition-colors duration-300 ${darkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-black shadow-sm'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">Accuracy & Convergence Comparison Graph</h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Comparing ancient approximation error rates vs. modern computational benchmarks across iterations for input {resultData.input_value}.</p>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-xl">
              Accuracy: {resultData.accuracy_percent}%
            </span>
          </div>

          <div className={`p-6 rounded-xl space-y-4 border ${darkMode ? 'bg-[#121824] border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
            <div className="flex items-center gap-6 text-xs font-semibold pb-2">
              <div className="flex items-center gap-2">
                <span className="w-4 h-2 bg-purple-500 rounded-xs inline-block"></span> 
                <span className="text-purple-500">Ancient Vedic Approximation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-2 bg-cyan-500 rounded-xs inline-block"></span> 
                <span className="text-cyan-600">Modern Computational Ground Truth</span>
              </div>
            </div>

            {/* Dynamic SVG Line Chart */}
            <div className={`relative w-full h-64 border rounded-lg p-4 flex flex-col justify-between overflow-hidden ${darkMode ? 'bg-[#0d131f] border-slate-800' : 'bg-white border-slate-300'}`}>
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200">
                <line x1="40" y1="20" x2="580" y2="20" stroke={darkMode ? "#1e293b" : "#cbd5e1"} strokeDasharray="4 4" />
                <line x1="40" y1="60" x2="580" y2="60" stroke={darkMode ? "#1e293b" : "#cbd5e1"} strokeDasharray="4 4" />
                <line x1="40" y1="100" x2="580" y2="100" stroke={darkMode ? "#1e293b" : "#cbd5e1"} strokeDasharray="4 4" />
                <line x1="40" y1="140" x2="580" y2="140" stroke={darkMode ? "#1e293b" : "#cbd5e1"} strokeDasharray="4 4" />
                <line x1="40" y1="180" x2="580" y2="180" stroke={darkMode ? "#334155" : "#94a3b8"} strokeWidth="1" />

                <text x="32" y="24" fill="#64748b" fontSize="10" textAnchor="end">11.2</text>
                <text x="32" y="64" fill="#64748b" fontSize="10" textAnchor="end">11.0</text>
                <text x="32" y="104" fill="#64748b" fontSize="10" textAnchor="end">10.8</text>
                <text x="32" y="144" fill="#64748b" fontSize="10" textAnchor="end">10.4</text>
                <text x="32" y="184" fill="#64748b" fontSize="10" textAnchor="end">10.0</text>

                {(() => {
                  const anc = resultData.graph_data.ancient_curve;
                  const mod = resultData.graph_data.modern_curve;
                  const minV = Math.min(...anc, ...mod) * 0.98;
                  const maxV = Math.max(...anc, ...mod) * 1.02;
                  const range = maxV - minV || 1;

                  const getCoordinates = (arr) => {
                    return arr.map((val, idx) => {
                      const x = 80 + idx * 120;
                      const y = 180 - ((val - minV) / range) * 150;
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

              <div className="flex justify-between px-8 text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-300">
                <span>Iter 1</span>
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

export default App;