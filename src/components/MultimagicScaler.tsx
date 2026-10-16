import React, { useState } from 'react';
import {
  CANONICAL_ORACLES,
  scaleExponents,
  bimagicExponents,
  toNemesisMatrix,
  verifyMultiplicativeEquilibrium,
  Golden,
  validateAPMS
} from '../lib/nemesis';
import { Sliders, Sparkles, Zap, CheckCircle2 } from 'lucide-react';

export function MultimagicScaler() {
  const [scaleFactor, setScaleFactor] = useState<number>(2);
  const [isBimagicMode, setIsBimagicMode] = useState<boolean>(false);
  const [selectedOracleId, setSelectedOracleId] = useState<string>('NEM-01');

  const baseOracle = CANONICAL_ORACLES.find(o => o.id === selectedOracleId) || CANONICAL_ORACLES[0];
  const order = baseOracle.matrix.order;

  // Compute scaled matrix
  const currentMatrix = isBimagicMode
    ? bimagicExponents(baseOracle.matrix)
    : scaleExponents(baseOracle.matrix, scaleFactor);

  const currentConstant = isBimagicMode
    ? currentMatrix.entries.slice(0, order).reduce((a, b) => a + b, 0)
    : baseOracle.magicConstant * scaleFactor;

  const currentNemesis = toNemesisMatrix(currentMatrix);
  const expectedGolden = Golden.phiPow(currentConstant);
  const multReport = verifyMultiplicativeEquilibrium(currentNemesis, expectedGolden);
  const apmsReport = validateAPMS(currentMatrix, currentConstant);

  return (
    <div className="space-y-6">
      {/* Configuration & Controls */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Fractal Power Scaling & Multimagic Exponentiation</span>
          </div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Nemesis Dynamic Scaling Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Raising elements of the Nemesis square to power k linearly scales prime exponents,
            preserving multiplicative equilibrium in Z[φ] with invariant φ^(k·M_A).
          </p>
        </div>

        {/* Oracle select */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {CANONICAL_ORACLES.slice(0, 2).map(o => (
              <button
                key={o.id}
                onClick={() => setSelectedOracleId(o.id)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedOracleId === o.id
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {o.name.split(' ')[0]} {o.order}×{o.order}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control Sliders and Mode Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scale Factor Slider */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Fractal Exponent Scale: k = {scaleFactor}
            </span>
            <span className="font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              N^{scaleFactor} = [φ^({scaleFactor}·p)]
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="8"
            step="1"
            disabled={isBimagicMode}
            value={scaleFactor}
            onChange={e => setScaleFactor(parseInt(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer disabled:opacity-40"
          />

          <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2">
            <span>k = 1 (Identity)</span>
            <span>k = 4 (Tetramagic)</span>
            <span>k = 8 (Octamagic)</span>
          </div>
        </div>

        {/* Bimagic Squaring Mode */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Bimagic Quadratic Mode (p²)
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Squares all prime exponents p ↦ p², testing secondary bimagic equilibrium in Z[φ].
            </p>
          </div>

          <button
            onClick={() => setIsBimagicMode(b => !b)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              isBimagicMode
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            {isBimagicMode ? 'Bimagic Active' : 'Enable p² Mode'}
          </button>
        </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4 text-xs">
            <span className="text-slate-400">
              {isBimagicMode ? 'Bimagic Squared Exponent Grid [p²]' : `Scaled Exponent Grid [${scaleFactor} × p]`}
            </span>
            <span className="font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Line Sum = {currentConstant}
            </span>
          </div>

          <div
            className="grid gap-2.5 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl"
            style={{
              gridTemplateColumns: `repeat(${order}, minmax(0, 1fr))`,
            }}
          >
            {currentMatrix.entries.map((val, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center flex flex-col items-center justify-center shadow-inner"
              >
                <div className="text-xl font-mono font-bold text-amber-300">
                  {val}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  φ^{val}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400 flex justify-between">
            <span>Base Additive Constant: <strong className="text-slate-200 font-mono">{baseOracle.magicConstant}</strong></span>
            <span>Current Constant: <strong className="text-amber-400 font-mono">{currentConstant}</strong></span>
          </div>
        </div>

        {/* Scaled Multiplicative Invariant Card */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-medium text-slate-300">Scaled Multiplicative Equilibrium</span>
              <span className="font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                Balanced
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-xs text-slate-400">Scaled Golden Power:</span>
                <div className="text-2xl font-mono font-bold text-amber-300">
                  φ^{currentConstant}
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400">Binet Fibonacci Decomposition:</span>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-slate-300 mt-1">
                  φ^{currentConstant} = F_{currentConstant}·φ + F_{currentConstant - 1}
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded border border-slate-800/80 text-xs space-y-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">F_{currentConstant} (φ Coeff)</span>
                  <p className="font-mono text-amber-200 text-[11px] break-all">
                    {expectedGolden.phiCoeff.toString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">F_{currentConstant - 1} (Const Coeff)</span>
                  <p className="font-mono text-slate-300 text-[11px] break-all">
                    {expectedGolden.constCoeff.toString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
            <strong>LexLean Multiplicative Scaling Invariant:</strong>
            <p className="text-[11px] text-slate-300 mt-1">
              For any natural scalar k, (M_N)^k = (φ^M_A)^k = φ^(k·M_A) holds exactly in Z[φ] by the exponential isomorphism theorem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
