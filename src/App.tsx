/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OracleInspector } from './components/OracleInspector';
import { HypermatrixVisualizer } from './components/HypermatrixVisualizer';
import { MultimagicScaler } from './components/MultimagicScaler';
import { PipelineTerminal } from './components/PipelineTerminal';
import { SourceViewer } from './components/SourceViewer';
import { MatrixBuilder } from './components/MatrixBuilder';
import {
  ShieldCheck,
  Rotate3d,
  Sliders,
  Terminal,
  FileCode,
  Calculator,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'oracles' | '3d-hyper' | 'scaling' | 'pipeline' | 'builder' | 'source'
  >('oracles');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top System Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Branding / Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold font-mono text-sm shadow-md shadow-amber-500/20">
                φ
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Nemesis Hypermatrix Engine
                  </h1>
                  <span className="hidden sm:inline-block text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    LexLean 1.2
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                  <span>PrismPM v0.3.0</span>
                  <span className="text-slate-600">·</span>
                  <span>trust_level = 0</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-emerald-400">Anti-Vacuity Enforced</span>
                </div>
              </div>
            </div>

            {/* Quick Badges / Action */}
            <div className="hidden md:flex items-center gap-3 text-xs">
              <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Z[φ] ⊂ Q(√5)</span>
              </div>
              <button
                onClick={() => setActiveTab('pipeline')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>just vv</span>
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 -mb-px border-t border-slate-800/40 pt-2 text-xs">
            <button
              onClick={() => setActiveTab('oracles')}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'oracles'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Oracles & Proofs</span>
            </button>

            <button
              onClick={() => setActiveTab('3d-hyper')}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === '3d-hyper'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Rotate3d className="w-4 h-4 text-amber-400" />
              <span>3D Hypermatrix Visualizer</span>
            </button>

            <button
              onClick={() => setActiveTab('scaling')}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'scaling'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Multimagic & Scaling</span>
            </button>

            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'builder'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Matrix Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'pipeline'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Pipeline & Bug Fixes</span>
            </button>

            <button
              onClick={() => setActiveTab('source')}
              className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'source'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <FileCode className="w-4 h-4 text-purple-400" />
              <span>Literate Source Graph</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'oracles' && <OracleInspector />}
        {activeTab === '3d-hyper' && <HypermatrixVisualizer />}
        {activeTab === 'scaling' && <MultimagicScaler />}
        {activeTab === 'builder' && <MatrixBuilder />}
        {activeTab === 'pipeline' && <PipelineTerminal />}
        {activeTab === 'source' && <SourceViewer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono">
            <span>UOR Foundation</span>
            <span>·</span>
            <span>PrismPM v0.3.0</span>
            <span>·</span>
            <span>LexLean 1.2 Kernel Verified</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Z[φ] Arithmetic</span>
            <span>·</span>
            <span>Anti-Vacuity (Zero Sorry)</span>
            <span>·</span>
            <span>LCNF Extractable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
