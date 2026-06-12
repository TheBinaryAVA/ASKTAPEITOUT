import React, { useState } from 'react';

export default function ErrorAnalyzer() {
    const [tool, setTool] = useState('');
    const [category, setCategory] = useState('');
    const [log, setLog] = useState('');

    return (
        <div className="min-h-screen bg-abyss text-canvas p-8 md:p-16 flex flex-col items-center">

            {/* Header Section */}
            <div className="w-full max-w-3xl mb-10 text-center">
                <h1 className="text-5xl font-display font-bold text-canvas mb-4">
                    Diagnose Failure.
                </h1>
                <p className="text-lg font-editorial text-stone">
                    Paste your failing log, select your EDA toolchain, and let Atlas chart the fix.
                </p>
            </div>

            {/* The Form Card */}
            <div className="w-full max-w-3xl bg-[#141b2d] border border-stone/20 rounded-xl p-8 shadow-2xl">
                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Toolchain Selection */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold tracking-widest text-stone uppercase">
                                Toolchain
                            </label>
                            <select
                                className="bg-abyss border border-stone/30 rounded-md px-4 py-3 text-canvas focus:outline-none focus:border-meridian transition-colors appearance-none"
                                value={tool}
                                onChange={(e) => setTool(e.target.value)}
                            >
                                <option value="" disabled>Select a tool...</option>
                                <option value="vivado">Xilinx Vivado</option>
                                <option value="yosys">Yosys</option>
                                <option value="openroad">OpenROAD</option>
                                <option value="magic">Magic VLSI</option>
                            </select>
                        </div>

                        {/* Error Category Selection */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold tracking-widest text-stone uppercase">
                                Error Category
                            </label>
                            <select
                                className="bg-abyss border border-stone/30 rounded-md px-4 py-3 text-canvas focus:outline-none focus:border-meridian transition-colors appearance-none"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="" disabled>Select category...</option>
                                <option value="timing">Timing Violation (Setup/Hold)</option>
                                <option value="drc">DRC / LVS Mismatch</option>
                                <option value="synthesis">Synthesis / Latch Inference</option>
                                <option value="routing">Routing Congestion</option>
                            </select>
                        </div>
                    </div>

                    {/* Raw Log Input (Terminal Style) */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-bold tracking-widest text-stone uppercase">
                                Raw Error Signature
                            </label>
                            <span className="text-meridian text-xs font-mono lowercase">Waiting for input...</span>
                        </div>

                        <textarea
                            rows={8}
                            placeholder="Paste your exact terminal output here... (e.g., ERROR: [Timing 38-282] The design failed to meet the timing requirements.)"
                            className="bg-black/50 border border-stone/20 rounded-md p-4 font-mono text-sm text-stone focus:outline-none focus:border-meridian focus:ring-1 focus:ring-meridian/50 transition-all w-full resize-y"
                            value={log}
                            onChange={(e) => setLog(e.target.value)}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 flex justify-end border-t border-stone/10">
                        <button
                            type="submit"
                            className="bg-canvas text-abyss font-bold px-8 py-3 rounded hover:bg-canvas/90 transition-all flex items-center gap-2"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m22 2-7 20-4-9-9-4Z"/>
                                <path d="M22 2 11 13"/>
                            </svg>
                            Run Diagnostics
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}