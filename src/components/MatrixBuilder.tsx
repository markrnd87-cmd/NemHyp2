import React, { useState, useMemo } from 'react';
import {
  Matrix2D,
  validateAPMS,
  toNemesisMatrix,
  verifyMultiplicativeEquilibrium,
  det3x3,
  Golden,
  isPrime,
  allDistinct,
  CANONICAL_ORACLES
} from '../lib/nemesis';
import { Sparkles, AlertCircle, CheckCircle2, RotateCcw, Calculator, ArrowRight } from 'lucide-react';

export function MatrixBuilder() {
  const [order, setOrder] = useState<number>(3);
  const [entries, setEntries] = useState<number[]>([
    17, 89, 71,
    113, 59, 5,
    47, 29, 101,
  ]);
  const [targetConstant, setTargetConstant] = useState<number>(177);

  const matrix: Matrix2D<number> = useMemo(() => ({
    order,
    entries,
  }), [order, entries]);

  // Validation
  const apmsReport = useMemo(() => {
    return validateAPMS(matrix, targetConstant);
  }, [matrix, targetConstant]);

  const nemesisMatrix = useMemo(() => {
    return toNemesisMatrix(matrix);
  }, [matrix]);

  const expectedGolden = useMemo(() => {
    return Golden.phiPow(targetConstant);
  }, [targetConstant]);

  const multReport = useMemo(() => {
    return verifyMultiplicativeEquilibrium(nemesisMatrix, expectedGolden);
  }, [nemesisMatrix, expectedGolden]);

  const detResult = useMemo(() => {
    if (order === 3 && entries.length === 9) {
      return det3x3(matrix);
    }
    return null;
  }, [order, entries, matrix]);

  const handleCellChange = (index: number, valStr: string) => {
    const val = parseInt(valStr, 10);
    const newEntries = [...entries];
    newEntries[index] = isNaN(val) ? 0 : Math.max(0, val);
    setEntries(newEntries);
  };

  const handleOrderChange = (newOrder: number) => {
    setOrder(newOrder);
    if (newOrder === 3) {
      setEntries([
        17, 89, 71,
        113, 59, 5,
        47, 29, 101,
      ]);
      setTargetConstant(177);
    } else {
      setEntries([
        37, 83, 97, 41,
        53, 61, 71, 73,
        89, 67, 59, 43,
        79, 47, 31, 101,
      ]);
      setTargetConstant(258);
    }
  };

  const loadPreset = (presetName: string) => {
    if (presetName === 'sayles') {
      setOrder(3);
      setEntries([...CANONICAL_ORACLES[0].matrix.entries]);
      setTargetConstant(177);
    } else if (presetName === 'johnson') {
      setOrder(4);
      setEntries([...CANONICAL_ORACLES[1].matrix.entries]);
      setTargetConstant(258);
    } else if (presetName === 'sallows') {
      setOrder(4);
      setEntries([...CANONICAL_ORACLES[3].matrix.entries]);
      setTargetConstant(120);
    } else if (presetName === 'loshu') {
      setOrder(3);
      setEntries([4, 9, 2, 3, 5, 7, 8, 1, 6]);
      setTargetConstant(15);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>Interactive Custom Matrix Studio</span>
          </div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Nemesis Matrix Synthesizer & APMS Auditor
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Input custom prime entries to test row/col/diagonal sum equilibrium, distinctness,
            primality, and automatic lifting into the multiplicative golden ring Z[φ].
          </p>
        </div>

        {/* Presets and Dimension */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => handleOrderChange(3)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                order === 3 ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3×3 Matrix
            </button>
            <button
              onClick={() => handleOrderChange(4)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                order === 4 ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              4×4 Matrix
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => loadPreset('sayles')}
              className="px-2.5 py-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded"
            >
              Sayles (177)
            </button>
            <button
              onClick={() => loadPreset('johnson')}
              className="px-2.5 py-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded"
            >
              Johnson (258)
            </button>
            <button
              onClick={() => loadPreset('sallows')}
              className="px-2.5 py-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded"
            >
              Sallows (120)
            </button>
          </div>
        </div>
      </div>

      {/* Target Constant Control */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-300 font-medium">Target Additive Magic Constant (M_A):</span>
          <input
            type="number"
            value={targetConstant}
            onChange={e => setTargetConstant(parseInt(e.target.value) || 0)}
            className="w-24 px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-amber-300 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${apmsReport.primesOk ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            <span className={apmsReport.primesOk ? 'text-emerald-400' : 'text-rose-400'}>
              {apmsReport.primesOk ? 'All Prime (p ∈ ℙ)' : 'Non-prime entries present'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${apmsReport.distinctOk ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            <span className={apmsReport.distinctOk ? 'text-emerald-400' : 'text-rose-400'}>
              {apmsReport.distinctOk ? 'All Distinct' : 'Duplicate entries present'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${apmsReport.allOk ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={apmsReport.allOk ? 'text-emerald-400' : 'text-amber-400'}>
              {apmsReport.allOk ? 'APMS Certified' : 'Unbalanced Sums'}
            </span>
          </div>
        </div>
      </div>

      {/* Matrix Input & Nemesis Lift */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Exponent Matrix */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="text-slate-300 font-medium">Exponent Matrix P (Editable)</span>
            <span className="text-slate-500 font-mono">p_{'{i,j}'}</span>
          </div>

          <div
            className="grid gap-2.5 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl"
            style={{
              gridTemplateColumns: `repeat(${order}, minmax(0, 1fr))`,
            }}
          >
            {entries.map((val, idx) => {
              const prime = isPrime(val);
              return (
                <div key={idx} className="relative">
                  <input
                    type="number"
                    value={val}
                    onChange={e => handleCellChange(idx, e.target.value)}
                    className={`w-full p-3 text-center rounded-lg font-mono font-bold text-lg focus:outline-none transition-all ${
                      prime
                        ? 'bg-slate-900 text-amber-300 border border-slate-800 focus:border-amber-400'
                        : 'bg-rose-950/30 text-rose-300 border border-rose-800/60 focus:border-rose-400'
                    }`}
                  />
                  {!prime && val > 0 && (
                    <span className="absolute bottom-1 right-1 text-[9px] text-rose-400 font-mono">
                      composite
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Row Sum breakdown */}
          <div className="mt-4 space-y-1.5 text-xs font-mono">
            {apmsReport.rowSums.map((sum, r) => (
              <div key={r} className="flex justify-between p-1.5 bg-slate-950/50 rounded px-2.5">
                <span className="text-slate-400">Row {r} Sum:</span>
                <span className={sum === targetConstant ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                  {sum} {sum === targetConstant ? '✓' : `(diff: ${sum - targetConstant})`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lifted Nemesis Matrix in Z[phi] */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-slate-300 font-medium">Elevated Nemesis Square N = [φ^p] in Z[φ]</span>
              <span className="font-mono text-amber-400">φ^p = F_p·φ + F_{'{p-1}'}</span>
            </div>

            <div
              className="grid gap-2 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl"
              style={{
                gridTemplateColumns: `repeat(${order}, minmax(0, 1fr))`,
              }}
            >
              {nemesisMatrix.entries.map((g, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-lg text-center flex flex-col items-center justify-center overflow-hidden"
                >
                  <span className="font-mono text-xs font-bold text-amber-300">
                    φ^{entries[idx]}
                  </span>
                  <span className="font-mono text-[9px] text-slate-400 truncate max-w-full mt-0.5">
                    {Golden.formatAbbreviated(g)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Multiplicative Invariant:</span>
                <span className="font-mono text-amber-300">φ^{targetConstant}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-300 break-all p-2 bg-slate-900/80 rounded border border-slate-800/60">
                {Golden.format(expectedGolden)}
              </div>
            </div>
          </div>

          {/* 3x3 Determinant if applicable */}
          {detResult && (
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs">
              <div className="flex justify-between items-center mb-1 text-slate-300">
                <span>Leibniz Determinant det(N):</span>
                <span className="text-emerald-400 font-mono">
                  {detResult.isNonSingular ? 'Non-Singular (det != 0)' : 'Singular'}
                </span>
              </div>
              <div className="font-mono text-[11px] text-amber-200 p-2 bg-slate-950 rounded border border-slate-800 break-all">
                {Golden.format(detResult.det)}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Field Norm N(det) = {detResult.norm.toString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
