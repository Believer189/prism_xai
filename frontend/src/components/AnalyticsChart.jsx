// frontend/src/components/AnalyticsChart.jsx
import React from 'react';
import { BarChart3, Award } from 'lucide-react';

const AnalyticsChart = ({ comparisonData }) => {
    if (!comparisonData) return null;

    const modernVal = Number(comparisonData.modern_standard ?? 0);
    const ancientVal = Number(comparisonData.ancient_value ?? 0);
    const accuracy = Number(comparisonData.accuracy_percent ?? 100);

    // Determine scale max for the Y-axis
    const rawMax = Math.max(Math.abs(modernVal), Math.abs(ancientVal), 1);
    const yMax = rawMax <= 5 ? Math.ceil(rawMax * 1.2) : Math.ceil(rawMax);
    
    // SVG Dimensions
    const width = 500;
    const height = 300;
    const paddingLeft = 60;
    const paddingRight = 40;
    const paddingTop = 40;
    const paddingBottom = 60;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    // Helper to scale Y coordinate
    const getY = (val) => {
        const clamped = Math.max(0, Math.min(val, yMax));
        return height - paddingBottom - (clamped / yMax) * plotHeight;
    };

    const barWidth = 45;
    const groupWidth = 120;
    const startX1 = paddingLeft + 50;
    const startX2 = startX1 + groupWidth + 40;

    const ancientY = getY(ancientVal);
    const modernY = getY(modernVal);

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <BarChart3 className="text-emerald-600 w-5 h-5" />
                <h3 className="text-lg font-semibold text-slate-900">
                    Comparative Bar Analysis
                </h3>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50/60 p-4 rounded-lg border border-emerald-100">
                    <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">Ancient Approximation</p>
                    <p className="text-xl font-bold text-emerald-900 font-mono">{ancientVal.toFixed(6)}</p>
                </div>
                <div className="bg-blue-50/60 p-4 rounded-lg border border-blue-100">
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">Modern IEEE Standard</p>
                    <p className="text-xl font-bold text-blue-900 font-mono">{modernVal.toFixed(6)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Accuracy Score</p>
                    <p className="text-xl font-bold text-indigo-600 font-mono">{accuracy.toFixed(4)}%</p>
                </div>
            </div>

            {/* Textbook Style Grouped Bar Chart matching your reference image */}
            <div className="bg-white rounded-xl p-4 border-2 border-blue-400 shadow-sm space-y-3">
                <div className="text-center font-bold text-slate-800 text-sm md:text-base tracking-wide">
                    Algorithm Output & Reference Standard Benchmarking
                </div>

                <div className="relative w-full flex justify-center overflow-x-auto">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-lg h-auto">
                        {/* Horizontal Grid lines (0%, 25%, 50%, 75%, 100%) */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                            const val = yMax * ratio;
                            const yPos = getY(val);
                            return (
                                <g key={idx}>
                                    <line x1={paddingLeft} y1={yPos} x2={width - paddingRight} y2={yPos} stroke="#e2e8f0" strokeWidth="1" />
                                    <text x={paddingLeft - 10} y={yPos + 4} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="sans-serif">
                                        {val >= 10 ? val.toFixed(0) : val.toFixed(2)}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Y Axis Label */}
                        <text x={20} y={height / 2} transform={`rotate(-90 20 ${height / 2})`} textAnchor="middle" fill="#334155" fontSize="11" fontWeight="600">
                            Computed Value Scale
                        </text>

                        {/* Y and X Axis Lines */}
                        <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="#3b82f6" strokeWidth="2" />
                        <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="#3b82f6" strokeWidth="2" />

                        {/* Bar 1: Ancient Value (Green) */}
                        <g>
                            <rect 
                                x={startX1} 
                                y={ancientY} 
                                width={barWidth} 
                                height={height - paddingBottom - ancientY} 
                                fill="#22c55e" 
                                rx="2"
                            />
                            <text x={startX1 + barWidth / 2} y={ancientY - 6} textAnchor="middle" fill="#1e293b" fontSize="11" fontWeight="bold" fontFamily="monospace">
                                {ancientVal.toFixed(2)}
                            </text>
                            <text x={startX1 + barWidth / 2} y={height - paddingBottom + 20} textAnchor="middle" fill="#334155" fontSize="11" fontWeight="600">
                                Ancient Result
                            </text>
                        </g>

                        {/* Bar 2: Modern Standard (Red/Orange) */}
                        <g>
                            <rect 
                                x={startX2} 
                                y={modernY} 
                                width={barWidth} 
                                height={height - paddingBottom - modernY} 
                                fill="#ef4444" 
                                rx="2"
                            />
                            <text x={startX2 + barWidth / 2} y={modernY - 6} textAnchor="middle" fill="#1e293b" fontSize="11" fontWeight="bold" fontFamily="monospace">
                                {modernVal.toFixed(2)}
                            </text>
                            <text x={startX2 + barWidth / 2} y={height - paddingBottom + 20} textAnchor="middle" fill="#334155" fontSize="11" fontWeight="600">
                                Modern Standard
                            </text>
                        </g>
                    </svg>
                </div>

                {/* Legend matching reference style */}
                <div className="flex items-center justify-center gap-6 pt-2 text-xs font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                        <span>Ancient Value</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                        <span>Modern Reference</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Bar chart comparing computed ancient output directly against modern reference standards.
                </span>
                <span className="font-mono font-medium text-slate-700">Verified</span>
            </div>
        </div>
    );
};

export default AnalyticsChart;