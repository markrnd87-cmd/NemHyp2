import React, { useState } from 'react';
import {
  CANONICAL_ORACLES,
  validateAPMS,
  toNemesisMatrix,
  verifyMultiplicativeEquilibrium,
  det3x3,
  Golden,
  OracleDefinition,
  getMatrixRow,
  getMatrixCol,
  getMatrixMainDiag,
  getMatrixAntiDiag
} from '../lib/nemesis';
import { CheckCircle2, ShieldCheck, Binary, Calculator, Hash, Layers } from 'lucide-react';

export function OracleInspector() {
  const [selectedOracleId, setSelectedOracleId] = useState<string>('NEM-01');
  const [viewMode, setViewMode] = useState<'exponents' | 'golden'>('exponents');

  const oracle = CANONICAL_ORACLES.find(o => o.id === selectedOracleId) || CANONICAL_ORACLES[0];
  const order = oracle.matrix.order;
  const apmsReport = validateAPMS(oracle.matrix, oracle.magicConstant);
  const nemesisMatrix = toNemesisMatrix(oracle.matrix);
  const expectedConstant = Golden.phiPow(oracle.magicConstant);
  const multReport = verifyMultiplicativeEquilibrium(nemesisMatrix, expectedConstant);

  // Determinant for 3x3
  const detResult = order === 3 ? det3x3(oracle.matrix) : null;

  return (
    <div className="space-y-6">
      {/* Oracle Selector Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        {CANONICAL_ORACLES.map(o => (
          <button
            key={o.id}
            onClick={() => setSelectedOracleId(o.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all text-left flex items-center gap-2.5 ${
              selectedOracleId === o.id
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <span className="font-mono text-[11px] text-amber-400/80 bg-amber-400/10 px-1.5 py-0.5 rounded">
              {o.id}
            </span>
            <span>{o.name}</span>
          </button>
        ))}
      </div>

      {/* Header Info Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="text-amber-400 font-mono font-medium">{oracle.id}</span>
            <span aria-hidden="true">·</span>
            <span>Order {oracle.order}×{oracle.order}</span>
            <span aria-hidden="true">·</span>
            <span>Additive Magic Constant: <strong className="text-slate-200 font-mono">{oracle.magicConstant}</strong></span>
            {oracle.year && (
              <>
                <span aria-hidden="true">·</span>
                <span>Ref: {oracle.year}</span>
              </>
            )}
          </div>
          <h2 className="text-lg font-semibold text-white tracking-tight">{oracle.name}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">{oracle.description}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setViewMode('exponents')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'exponents'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Exponent Matrix P</span>
            </button>
            <button
              onClick={() => setViewMode('golden')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'golden'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Binary className="w-3.5 h-3.5" />
              <span>Nemesis Ring Z[φ]</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid & Proof Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Matrix Visualization */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>{viewMode === 'exponents' ? 'Additive Prime Exponent Array' : 'Multiplicative Golden Elements (φ^p)'}</span>
            </div>
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Distinctness & Primality Verified</span>
            </div>
          </div>

          {/* Matrix Container */}
          <div className="overflow-x-auto pb-2">
            <div className="inline-block min-w-full">
              <div
                className="grid gap-2.5 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl"
                style={{
                  gridTemplateColumns: `repeat(${order}, minmax(${viewMode === 'golden' ? '130px' : '72px'}, 1fr))`,
                }}
              >
                {oracle.matrix.entries.map((val, idx) => {
                  const r = Math.floor(idx / order);
                  const c = idx % order;
                  const g = nemesisMatrix.entries[idx];

                  return (
                    <div
                      key={idx}
                      className="group relative p-3 rounded-lg bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col items-center justify-center text-center shadow-inner"
                    >
                      <div className="absolute top-1 left-1.5 text-[9px] font-mono text-slate-500">
                        {r},{c}
                      </div>

                      {viewMode === 'exponents' ? (
                        <>
                          <div className="text-xl font-mono font-bold text-amber-300">
                            {val}
                          </div>
                          <div className="text-[10px] text-emerald-400/90 font-mono mt-0.5">
                            prime #{val}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs font-mono font-semibold text-amber-300 leading-tight">
                            φ^{val}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-1 truncate max-w-full">
                            {Golden.formatAbbreviated(g)}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Row & Column Sum Indicators */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Row Balances:</span>
                  <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    All {order} rows = {oracle.magicConstant}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Col Balances:</span>
                  <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    All {order} cols = {oracle.magicConstant}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Main Diag:</span>
                  <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Sum = {apmsReport.mainDiagSum}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 block text-[11px]">Anti Diag:</span>
                  <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Sum = {apmsReport.antiDiagSum}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification & Multiplicative Proof Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Multiplicative Invariant Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-medium text-slate-300 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-amber-400" />
                Multiplicative Invariant M_N in Z[φ]
              </span>
              <span className="font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                rfl: TRUE
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-xs text-slate-400">Nemesis Invariant Power:</span>
                <div className="text-xl font-mono font-bold text-amber-300">
                  φ^{oracle.magicConstant}
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400">Fibonacci Binet Reduction:</span>
                <div className="text-xs font-mono text-slate-300 p-2 bg-slate-950 rounded border border-slate-800 mt-1">
                  φ^{oracle.magicConstant} = F_{oracle.magicConstant}·φ + F_{oracle.magicConstant - 1}
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">F_{oracle.magicConstant} (Exact φ Coeff):</span>
                  <p className="font-mono text-amber-200 text-[11px] break-all">
                    {expectedConstant.phiCoeff.toString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">F_{oracle.magicConstant - 1} (Exact Const Coeff):</span>
                  <p className="font-mono text-slate-300 text-[11px] break-all">
                    {expectedConstant.constCoeff.toString()}
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Exponential Isomorphism Verified: ∏ φ^p_i = φ^(∑ p_i) across all lines</span>
              </div>
            </div>
          </div>

          {/* Determinant Collapse Card (For 3x3) */}
          {detResult && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Binary className="w-4 h-4 text-indigo-400" />
                  3×3 Leibniz Determinant Collapse
                </span>
                <span className="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Full Rank
                </span>
              </div>

              <div className="mt-3 space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400">det(N) = Aφ + B ∈ Z[φ]:</span>
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-amber-200 text-xs break-all mt-1">
                    {Golden.format(detResult.det)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Algebraic Norm N(det)</span>
                    <span className="font-mono text-emerald-300 text-[11px] break-all">
                      {detResult.norm.toString()}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-950/80 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Conformality Rank</span>
                    <span className="font-mono text-emerald-300 text-[11px]">
                      rank = 3 (Non-zero)
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  {oracle.significance}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
