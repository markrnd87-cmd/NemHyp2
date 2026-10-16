import React, { useState } from 'react';
import { FileCode, Copy, Check, ExternalLink } from 'lucide-react';

interface SourceFile {
  path: string;
  title: string;
  desc: string;
  code: string;
}

export function SourceViewer() {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [activeFileIdx, setActiveFileIdx] = useState<number>(0);

  const files: SourceFile[] = [
    {
      path: 'prismpm.toml',
      title: 'PrismPM Project Manifest',
      desc: 'Canonical project spec from UOR-Foundation/PrismPM defining holographic limits and build targets.',
      code: `spec = "prismpm/project/1"
project = "nemesis-hypermatrix"
lexlean_project = "lexlean.toml"
build_root = ".prism"

[limits]
max_holo_bytes = 16777216
max_entities = 100000
max_diagnostics = 256`,
    },
    {
      path: 'lexlean.toml',
      title: 'LexLean 1.2 Compiler Manifest',
      desc: 'Locks trust_level = 0, binds the literate module graph, and specifies exported symbols.',
      code: `[project]
name = "Nemesis"
version = "0.1.0"
edition = "2026"
language = "1.2"

[roots]
core = "src/Nemesis/Core.lex.tex"
specification = "src/Nemesis/Specification.lex.tex"
registry = "src/Nemesis/Registry.lex.tex"

[compiler]
max_heartbeats = 500000
trust_level = 0
export_roots = [
  "Nemesis.Core.GoldenInt.phiPow",
  "Nemesis.Core.GoldenInt.mul",
  "Nemesis.Core.GoldenInt.norm",
  "Nemesis.Specification.evalTrace",
  "Nemesis.Specification.det3x3",
  "Nemesis.Specification.scaleExponents",
  "Nemesis.Specification.bimagicExponents",
  "Nemesis.Registry.verifySayles3x3",
  "Nemesis.Registry.verifyJohnson4x4",
  "Nemesis.Registry.sayles3x3Determinant"
]`,
    },
    {
      path: 'src/Nemesis/Core.lex.tex',
      title: 'Nemesis.Core (Literate LaTeX / Lean 4)',
      desc: 'Defines Z[φ], exact arithmetic under φ² = φ + 1, Fibonacci reduction, norm, and inductive isomorphism proofs.',
      code: `\\documentclass{article}
\\usepackage{amsmath, amssymb, amsthm}

\\title{Nemesis Core: Exact Arithmetic and Isomorphism Proofs in $\\mathbb{Z}[\\phi] \\subset \\mathbb{Q}(\\sqrt{5})$}
\\author{Nemesis 3D Studio / UOR Foundation}
\\date{October 2026}

\\begin{document}

\\section{The Golden Ratio Ring $\\mathbb{Z}[\\phi]$}
The spatial base of the Nemesis architecture is the golden ratio $\\phi = \\frac{1+\\sqrt{5}}{2}$, satisfying the minimal polynomial $\\phi^2 - \\phi - 1 = 0$, or $\\phi^2 = \\phi + 1$. By Binet's reduction formulation, any natural power $n \\in \\mathbb{N}$ reduces strictly to a linear binomial over the Fibonacci sequence:
$$\\phi^n = F_n \\phi + F_{n-1}$$
Consequently, every element of the Nemesis Square and Nemesis Hyper Matrix resides strictly within the ring of integers $\\mathbb{Z}[\\phi] \\subset \\mathbb{Q}(\\sqrt{5})$.

\\begin{lean}
namespace Nemesis.Core

/-- An exact algebraic element $a\\phi + b \\in \\mathbb{Z}[\\phi] \\subset \\mathbb{Q}(\\sqrt{5})$. -/
structure GoldenInt where
  phiCoeff : Int
  constCoeff : Int
  deriving Repr, DecidableEq, Inhabited

namespace GoldenInt

@[ext]
theorem ext {x y : GoldenInt} (h1 : x.phiCoeff = y.phiCoeff) (h2 : x.constCoeff = y.constCoeff) : x = y := by
  cases x; cases y; cases h1; cases h2; rfl

def zero : GoldenInt := ⟨0, 0⟩
def one : GoldenInt := ⟨0, 1⟩
def phi : GoldenInt := ⟨1, 0⟩

def add (x y : GoldenInt) : GoldenInt :=
  ⟨x.phiCoeff + y.phiCoeff, x.constCoeff + y.constCoeff⟩

def sub (x y : GoldenInt) : GoldenInt :=
  ⟨x.phiCoeff - y.phiCoeff, x.constCoeff - y.constCoeff⟩

def neg (x : GoldenInt) : GoldenInt :=
  ⟨-x.phiCoeff, -x.constCoeff⟩

def mul (x y : GoldenInt) : GoldenInt :=
  let a := x.phiCoeff
  let b := x.constCoeff
  let c := y.phiCoeff
  let d := y.constCoeff
  ⟨a * c + a * d + b * c, a * c + b * d⟩

def conjugate (x : GoldenInt) : GoldenInt :=
  ⟨-x.phiCoeff, x.phiCoeff + x.constCoeff⟩

def norm (x : GoldenInt) : Int :=
  let a := x.phiCoeff
  let b := x.constCoeff
  b * b + a * b - a * a

instance : Zero GoldenInt := ⟨zero⟩
instance : One GoldenInt := ⟨one⟩
instance : Add GoldenInt := ⟨add⟩
instance : Sub GoldenInt := ⟨sub⟩
instance : Neg GoldenInt := ⟨neg⟩
instance : Mul GoldenInt := ⟨mul⟩

def fibPair : Nat → Int × Int
  | 0 => (0, 1)
  | n + 1 =>
    let p := fibPair n
    (p.1 + p.2, p.1)

def phiPow (n : Nat) : GoldenInt :=
  let p := fibPair n
  ⟨p.1, p.2⟩

theorem mul_one (x : GoldenInt) : mul x one = x := by
  cases x with | mk a b => simp [mul, one]

theorem one_mul (x : GoldenInt) : mul one x = x := by
  cases x with | mk a b => simp [mul, one]

theorem phiPow_succ (n : Nat) : phiPow (n + 1) = mul (phiPow n) phi := by
  unfold phiPow fibPair mul phi
  apply ext
  · simp [Int.mul_one, Int.mul_zero, Int.add_zero]
  · simp [Int.mul_one, Int.mul_zero, Int.add_zero]

theorem mul_assoc (x y z : GoldenInt) : mul (mul x y) z = mul x (mul y z) := by
  cases x with | mk a b =>
  cases y with | mk c d =>
  cases z with | mk e f =>
  unfold mul
  apply ext <;> dsimp <;> omega

theorem phiPow_add (a b : Nat) : mul (phiPow a) (phiPow b) = phiPow (a + b) := by
  induction b generalizing a with
  | zero =>
    change mul (phiPow a) one = phiPow (a + 0)
    rw [Nat.add_zero, mul_one]
  | succ b ih =>
    rw [Nat.add_succ, phiPow_succ (a + b), ← ih a, phiPow_succ b, ← mul_assoc]

end GoldenInt
end Nemesis.Core
\\end{lean}

\\end{document}`,
    },
    {
      path: 'src/Nemesis/Specification.lex.tex',
      title: 'Nemesis.Specification (LCNF Tensors & Oracles)',
      desc: 'Flat memory Matrix2D & HyperMatrixND, primality check, distinctness, APMS validation, and determinant collapse.',
      code: `\\documentclass{article}
\\usepackage{amsmath, amssymb}

\\title{Nemesis Specification: Prime Exponent Tensors, Determinant Collapse, and Multimagic Scaling}
\\author{Nemesis 3D Studio / UOR Foundation}
\\date{October 2026}

\\begin{document}

\\begin{lean}
import Nemesis.Core

namespace Nemesis.Specification
open Nemesis.Core

def isPrimeAux (n d : Nat) : Bool :=
  match d with
  | 0 => true
  | 1 => true
  | k + 1 =>
    if (k + 1) * (k + 1) > n then true
    else if n % (k + 1) == 0 then false
    else isPrimeAux n k

def isPrime (n : Nat) : Bool :=
  if n < 2 then false
  else isPrimeAux n (n - 1)

def allDistinct : List Nat → Bool
  | [] => true
  | x :: xs => !(xs.contains x) && allDistinct xs

def sumTrace (trace : List Nat) : Nat :=
  trace.foldl (· + ·) 0

def evalTrace (trace : List GoldenInt) : GoldenInt :=
  trace.foldl GoldenInt.mul GoldenInt.one

theorem evalTrace_phiPow_aux (trace : List Nat) (acc : Nat) :
  List.foldl GoldenInt.mul (GoldenInt.phiPow acc) (trace.map GoldenInt.phiPow) =
    GoldenInt.phiPow (trace.foldl (· + ·) acc) := by
  induction trace generalizing acc with
  | nil => rfl
  | cons hd tl ih =>
    simp [List.map, List.foldl]
    rw [GoldenInt.phiPow_add acc hd]
    exact ih (acc + hd)

theorem evalTrace_phiPow (trace : List Nat) :
  evalTrace (trace.map GoldenInt.phiPow) = GoldenInt.phiPow (sumTrace trace) := by
  unfold evalTrace sumTrace
  change List.foldl GoldenInt.mul (GoldenInt.phiPow 0) (trace.map GoldenInt.phiPow) = _
  exact evalTrace_phiPow_aux trace 0

structure Matrix2D (α : Type) where
  order : Nat
  entries : List α
  deriving Repr, DecidableEq

namespace Matrix2D
def get [Inhabited α] (M : Matrix2D α) (r c : Nat) : α :=
  M.entries.getD (r * M.order + c) default

def row [Inhabited α] (M : Matrix2D α) (r : Nat) : List α :=
  (List.range M.order).map (fun c => M.get r c)

def col [Inhabited α] (M : Matrix2D α) (c : Nat) : List α :=
  (List.range M.order).map (fun r => M.get r c)

def mainDiag [Inhabited α] (M : Matrix2D α) : List α :=
  (List.range M.order).map (fun i => M.get i i)

def antiDiag [Inhabited α] (M : Matrix2D α) : List α :=
  (List.range M.order).map (fun i => M.get i (M.order - 1 - i))
end Matrix2D

def isValidAPMS (M : Matrix2D Nat) (magicConstant : Nat) : Bool :=
  let n := M.order
  let sizeOk := M.entries.length == n * n
  let primesOk := M.entries.all isPrime
  let distinctOk := allDistinct M.entries
  let rowsOk := (List.range n).all (fun r => sumTrace (M.row r) == magicConstant)
  let colsOk := (List.range n).all (fun c => sumTrace (M.col c) == magicConstant)
  let diag1Ok := sumTrace M.mainDiag == magicConstant
  let diag2Ok := sumTrace M.antiDiag == magicConstant
  sizeOk && primesOk && distinctOk && rowsOk && colsOk && diag1Ok && diag2Ok

def toNemesisMatrix (P : Matrix2D Nat) : Matrix2D GoldenInt :=
  ⟨P.order, P.entries.map GoldenInt.phiPow⟩

def verifyMultiplicativeEquilibrium (N : Matrix2D GoldenInt) (expectedConstant : GoldenInt) : Bool :=
  let n := N.order
  let rowsOk := (List.range n).all (fun r => evalTrace (N.row r) == expectedConstant)
  let colsOk := (List.range n).all (fun c => evalTrace (N.col c) == expectedConstant)
  let diag1Ok := evalTrace N.mainDiag == expectedConstant
  let diag2Ok := evalTrace N.antiDiag == expectedConstant
  rowsOk && colsOk && diag1Ok && diag2Ok

def det3x3 (P : Matrix2D Nat) : GoldenInt :=
  let p00 := P.get 0 0; let p01 := P.get 0 1; let p02 := P.get 0 2
  let p10 := P.get 1 0; let p11 := P.get 1 1; let p12 := P.get 1 2
  let p20 := P.get 2 0; let p21 := P.get 2 1; let p22 := P.get 2 2
  let pos1 := GoldenInt.phiPow (p00 + p11 + p22)
  let pos2 := GoldenInt.phiPow (p01 + p12 + p20)
  let pos3 := GoldenInt.phiPow (p02 + p10 + p21)
  let neg1 := GoldenInt.phiPow (p02 + p11 + p20)
  let neg2 := GoldenInt.phiPow (p00 + p12 + p21)
  let neg3 := GoldenInt.phiPow (p01 + p10 + p22)
  (pos1 + pos2 + pos3) - (neg1 + neg2 + neg3)

def scaleExponents (P : Matrix2D Nat) (k : Nat) : Matrix2D Nat :=
  ⟨P.order, P.entries.map (· * k)⟩

def bimagicExponents (P : Matrix2D Nat) : Matrix2D Nat :=
  ⟨P.order, P.entries.map (fun p => p * p)⟩

structure HyperMatrixND (α : Type) where
  dimension : Nat
  order : Nat
  entries : List α
  deriving Repr, DecidableEq

def coordToFlatIndex (order : Nat) (coords : List Nat) : Nat :=
  coords.foldl (fun acc idx => acc * order + idx) 0

def extractPrimaryAgonal [Inhabited α] (H : HyperMatrixND α) : List α :=
  (List.range H.order).map fun i =>
    let coords := List.replicate H.dimension i
    H.entries.getD (coordToFlatIndex H.order coords) default

end Nemesis.Specification
\\end{lean}

\\end{document}`,
    },
    {
      path: 'src/Nemesis/Registry.lex.tex',
      title: 'Nemesis.Registry (Certified Oracles by rfl)',
      desc: 'Binds Sayles 3×3, Johnson 4×4 consecutive primes, 3×3 determinant non-singularity, and Sallows 4×4 minimal primes.',
      code: `\\documentclass{article}
\\usepackage{amsmath, amssymb}

\\title{Nemesis Registry: Kernel-Verified Conformance Oracles and Authority Bindings}
\\author{Nemesis 3D Studio / UOR Foundation}
\\date{October 2026}

\\begin{document}

\\begin{lean}
import Nemesis.Core
import Nemesis.Specification

namespace Nemesis.Registry
open Nemesis.Core
open Nemesis.Specification

def sayles3x3 : Matrix2D Nat :=
  { order := 3
  , entries := [
      17,  89,  71,
      113, 59,   5,
      47,  29, 101
    ] }

def expectedConstant3x3 : GoldenInt := GoldenInt.phiPow 177

def verifySayles3x3 : Bool :=
  isValidAPMS sayles3x3 177 &&
  verifyMultiplicativeEquilibrium (toNemesisMatrix sayles3x3) expectedConstant3x3

theorem nem01_sayles3x3_verified : verifySayles3x3 = true := by rfl

def johnson4x4 : Matrix2D Nat :=
  { order := 4
  , entries := [
      37, 83, 97,  41,
      53, 61, 71,  73,
      89, 67, 59,  43,
      79, 47, 31, 101
    ] }

def expectedConstant4x4 : GoldenInt := GoldenInt.phiPow 258

def verifyJohnson4x4 : Bool :=
  isValidAPMS johnson4x4 258 &&
  verifyMultiplicativeEquilibrium (toNemesisMatrix johnson4x4) expectedConstant4x4

theorem nem02_johnson4x4_verified : verifyJohnson4x4 = true := by rfl

def sayles3x3Determinant : GoldenInt := det3x3 sayles3x3

theorem nem03_sayles3x3_nonsingular : (sayles3x3Determinant != GoldenInt.zero) = true := by rfl

def sallowsJohnson4x4 : Matrix2D Nat :=
  { order := 4
  , entries := [
       3, 61, 19, 37,
      43, 31,  5, 41,
       7, 11, 73, 29,
      67, 17, 23, 13
    ] }

def expectedConstantSallows4x4 : GoldenInt := GoldenInt.phiPow 120

def verifySallows4x4 : Bool :=
  isValidAPMS sallowsJohnson4x4 120 &&
  verifyMultiplicativeEquilibrium (toNemesisMatrix sallowsJohnson4x4) expectedConstantSallows4x4

theorem nem04_sallows4x4_verified : verifySallows4x4 = true := by rfl

end Nemesis.Registry
\\end{lean}

\\end{document}`,
    },
  ];

  const currentFile = files[activeFileIdx];

  const copyCode = (code: string, path: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* File Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {files.map((f, idx) => (
          <button
            key={f.path}
            onClick={() => setActiveFileIdx(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
              activeFileIdx === idx
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="font-mono">{f.path}</span>
          </button>
        ))}
      </div>

      {/* File Meta Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-mono mb-1">
            <span>{currentFile.path}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-sans">Authoritative Source</span>
          </div>
          <h3 className="text-base font-semibold text-white">{currentFile.title}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">{currentFile.desc}</p>
        </div>

        <button
          onClick={() => copyCode(currentFile.code, currentFile.path)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 border border-slate-700/80 cursor-pointer shrink-0"
        >
          {copiedPath === currentFile.path ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Source</span>
            </>
          )}
        </button>
      </div>

      {/* Code Display */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 overflow-x-auto shadow-2xl">
        <pre className="font-mono text-xs text-slate-300 leading-relaxed">
          <code>{currentFile.code}</code>
        </pre>
      </div>
    </div>
  );
}
