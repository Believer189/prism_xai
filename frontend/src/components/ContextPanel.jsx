// frontend/src/components/ContextPanel.jsx
import React, { useState } from 'react';
import { Info, BookOpen, Calculator, Code2, FileText, Layers } from 'lucide-react';

const ContextPanel = ({ metadata }) => {
    if (!metadata) return null;

    const [isLatexView, setIsLatexView] = useState(false);

    const getFormulaDisplay = () => {
        if (!metadata.formula) return "";
        if (isLatexView) {
            if (metadata.formula.includes("xₙ₊₁")) return "x_{n+1} = x_n - \\frac{x_n^2 - N}{2x_n}";
            if (metadata.formula.includes("π")) return "\\pi \\approx \\frac{8(100 + 4) + 62000}{20000} = 3.1416";
            if (metadata.formula.includes("a * x")) return "a \\cdot x + b \\cdot y = c";
            if (metadata.formula.includes("A * x²")) return "A \\cdot x^2 + 1 = y^2";
        }
        return metadata.formula;
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Info className="text-emerald-600 w-5 h-5" />
                <h3 className="text-lg font-semibold text-slate-900">
                    {metadata.name || "Historical Context & Verse Meaning"}
                </h3>
            </div>

            {/* Meaning & Formula Display Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metadata.meaning && (
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                            <BookOpen className="w-4 h-4" />
                            <span>English Translation & Meaning</span>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed font-serif">
                            "{metadata.meaning}"
                        </p>
                    </div>
                )}

                {metadata.formula && (
                    <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                                    <Calculator className="w-4 h-4" />
                                    <span>Mathematical Formula</span>
                                </div>
                                <button
                                    onClick={() => setIsLatexView(!isLatexView)}
                                    title="Toggle Formula View Mode"
                                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded text-xs font-mono border border-slate-700 transition-colors cursor-pointer"
                                >
                                    {isLatexView ? <FileText className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                                    <span>{isLatexView ? "Plain Text" : "LaTeX Mode"}</span>
                                </button>
                            </div>
                            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-emerald-400 text-xs md:text-sm font-mono overflow-x-auto mt-2">
                                {getFormulaDisplay()}
                            </div>
                        </div>
                        <div className="text-[10px] text-slate-500 pt-2 text-right">
                            Format: {isLatexView ? "LaTeX Notation" : "Standard Human-Readable"}
                        </div>
                    </div>
                )}
            </div>

            {/* Word-by-Word Sanskrit Vocabulary Breakdown */}
            {metadata.word_meanings && metadata.word_meanings.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        <span>Word-by-Word Vocabulary Breakdown (Padartha)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                        {metadata.word_meanings.map((item, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-xs space-y-1">
                                <div className="text-xs font-serif font-bold text-emerald-700">
                                    {item.sanskrit}
                                </div>
                                <div className="text-xs text-slate-600 leading-snug">
                                    {item.meaning}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Existing Context Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">What It Solves</p>
                    <p className="text-sm text-slate-700">{metadata.solves}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Historical Usage</p>
                    <p className="text-sm text-slate-700">{metadata.usage}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Significance</p>
                    <p className="text-sm text-slate-700">{metadata.significance}</p>
                </div>
            </div>
        </div>
    );
};

export default ContextPanel;