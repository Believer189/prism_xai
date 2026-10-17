// frontend/src/components/ComputationLog.jsx
import React, { useState, useEffect } from 'react';
import { Terminal, CheckCircle2, Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

const ComputationLog = ({ computationData }) => {
    if (!computationData) return null;

    const allSteps = Array.isArray(computationData.steps) 
        ? computationData.steps 
        : [computationData.steps || computationData.result || "Computation completed successfully."];

    const [visibleCount, setVisibleCount] = useState(allSteps.length);
    const [isPlaying, setIsPlaying] = useState(false);

    // Reset visible steps when new computation data arrives
    useEffect(() => {
        setVisibleCount(allSteps.length);
        setIsPlaying(false);
    }, [computationData]);

    // Handle auto-play ticker
    useEffect(() => {
        let timer;
        if (isPlaying) {
            timer = setInterval(() => {
                setVisibleCount((prev) => {
                    if (prev >= allSteps.length) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 800); // 800ms per step
        }
        return () => clearInterval(timer);
    }, [isPlaying, allSteps.length]);

    const handlePlayPause = () => {
        if (visibleCount >= allSteps.length) {
            setVisibleCount(1); // Restart if at the end
        }
        setIsPlaying(!isPlaying);
    };

    const handleReset = () => {
        setIsPlaying(false);
        setVisibleCount(allSteps.length);
    };

    const handleStepForward = () => {
        setIsPlaying(false);
        setVisibleCount((prev) => Math.min(allSteps.length, prev + 1));
    };

    const handleStepBackward = () => {
        setIsPlaying(false);
        setVisibleCount((prev) => Math.max(1, prev - 1));
    };

    const displayedSteps = allSteps.slice(0, visibleCount);

    return (
        <div className="w-full max-w-4xl mx-auto bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden text-slate-100 font-mono">
            {/* Header & Playback Toolbar */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Terminal className="text-emerald-400 w-5 h-5" />
                    <h3 className="text-sm font-semibold tracking-wider uppercase text-emerald-400">
                        Algorithmic Execution Trace
                    </h3>
                </div>

                {/* Interactive Playback Controls Toolbar */}
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    <button 
                        onClick={handleReset}
                        title="Reset to Full / Start"
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={handleStepBackward}
                        title="Previous Step"
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <SkipBack className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={handlePlayPause}
                        title={isPlaying ? "Pause Simulation" : "Play Step-by-Step Animation"}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlaying ? "Pause" : "Play"}</span>
                    </button>
                    <button 
                        onClick={handleStepForward}
                        title="Next Step"
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <SkipForward className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono text-slate-400 pl-2 border-l border-slate-800">
                        {visibleCount}/{allSteps.length}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Status: Success</span>
                </div>
            </div>

            {/* Trace Steps Container */}
            <div className="p-6 space-y-3 max-h-[450px] overflow-y-auto">
                {displayedSteps.map((step, index) => {
                    const isStructuredObj = step && typeof step === 'object';
                    const stepNum = isStructuredObj ? (step.step || index + 1) : index + 1;
                    let actionText = isStructuredObj ? (step.action || step.description || JSON.stringify(step)) : step;
                    const valText = isStructuredObj ? step.current_value : null;

                    if (typeof actionText === 'string' && actionText.includes('Multiply sum by')) {
                        actionText = actionText.replace('. Multiply sum by', '.\nMultiply sum by');
                    }

                    return (
                        <div key={index} className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex items-center justify-between gap-4 animate-fadeIn">
                            <div className="space-y-1 flex-grow">
                                <div className="text-xs font-semibold text-emerald-400 tracking-wide">
                                    STEP {stepNum}
                                </div>
                                <div className="text-sm text-slate-200 font-sans whitespace-pre-line leading-relaxed">
                                    {String(actionText)}
                                </div>
                            </div>

                            {valText !== undefined && valText !== null && (
                                <div className="flex flex-col items-end flex-shrink-0 pl-4 border-l border-slate-800">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Value</span>
                                    <span className="text-sm font-bold font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-900/50">
                                        {String(valText)}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {visibleCount === allSteps.length && computationData.final_value !== undefined && (
                    <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-base bg-slate-950 p-4 rounded-lg border border-emerald-900/40">
                        <span className="text-slate-300 font-sans font-semibold">Final Computed Value:</span>
                        <span className="text-emerald-400 font-bold bg-emerald-950/80 px-3 py-1 rounded border border-emerald-700/50">
                            {computationData.final_value}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComputationLog;