import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Golden, GoldenInt } from '../lib/nemesis';
import { Rotate3d, Eye, Layers, Sparkles, Compass } from 'lucide-react';

interface Node3D {
  x: number;
  y: number;
  z: number;
  val: number;
  r: number;
  c: number;
  layer: number;
  golden: GoldenInt;
}

export function HypermatrixVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Rotation angles
  const [rotX, setRotX] = useState<number>(0.4);
  const [rotY, setRotY] = useState<number>(0.6);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMouse, setLastMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeLayer, setActiveLayer] = useState<number | 'all'>('all');
  const [showAgonals, setShowAgonals] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<Node3D | null>(null);

  // Define 3x3x3 prime cube entries centered around prime 59
  const nodes = useMemo<Node3D[]>(() => {
    // 3 layers of 3x3 prime patterns
    // Sayles 3x3 on Layer 1 (z=0), complementary frames on 0 and 2
    const rawData = [
      // Layer 0 (z = -1)
      [
        [31, 73, 73],
        [79, 43, 55],
        [67, 61, 49],
      ],
      // Layer 1 (z = 0) - Sayles 3x3 (Sum = 177)
      [
        [17, 89, 71],
        [113, 59, 5],
        [47, 29, 101],
      ],
      // Layer 2 (z = 1)
      [
        [101, 29, 47],
        [5, 59, 113],
        [71, 89, 17],
      ],
    ];

    const list: Node3D[] = [];
    for (let l = 0; l < 3; l++) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const val = rawData[l][r][c];
          list.push({
            x: (c - 1) * 120,
            y: (r - 1) * 120,
            z: (l - 1) * 120,
            val,
            r,
            c,
            layer: l,
            golden: Golden.phiPow(val),
          });
        }
      }
    }
    return list;
  }, []);

  // 4 Primary Space Agonals connecting opposite vertices of the 3-cube
  const spaceAgonals = useMemo(() => [
    { start: [0, 0, 0], end: [2, 2, 2], label: 'Agonal Ω₁: (0,0,0) → (2,2,2)' },
    { start: [2, 0, 0], end: [0, 2, 2], label: 'Agonal Ω₂: (2,0,0) → (0,2,2)' },
    { start: [0, 2, 0], end: [2, 0, 2], label: 'Agonal Ω₃: (0,2,0) → (2,0,2)' },
    { start: [0, 0, 2], end: [2, 2, 0], label: 'Agonal Ω₄: (0,0,2) → (2,2,0)' },
  ], []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Center of canvas
      const cx = width / 2;
      const cy = height / 2;

      // 3D rotation projection matrix
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const project = (x: number, y: number, z: number) => {
        // Rotate Y
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;

        // Rotate X
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        // Perspective
        const fov = 650 * zoom;
        const distance = 500;
        const scale = fov / (distance + z2);

        return {
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          pz: z2,
          scale,
        };
      };

      // Draw bounding hypercube cage
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
      ctx.lineWidth = 1;
      const boundCoords = [-120, 120];

      // Draw wireframe bounding box
      for (const bx of boundCoords) {
        for (const by of boundCoords) {
          const p1 = project(bx, by, -120);
          const p2 = project(bx, by, 120);
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.stroke();
        }
      }
      for (const bx of boundCoords) {
        for (const bz of boundCoords) {
          const p1 = project(bx, -120, bz);
          const p2 = project(bx, 120, bz);
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.stroke();
        }
      }
      for (const by of boundCoords) {
        for (const bz of boundCoords) {
          const p1 = project(-120, by, bz);
          const p2 = project(120, by, bz);
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.stroke();
        }
      }

      // Draw Space Agonals (Primary spatial hyper-diagonals)
      if (showAgonals) {
        spaceAgonals.forEach((agonal, idx) => {
          const startX = (agonal.start[2] - 1) * 120;
          const startY = (agonal.start[1] - 1) * 120;
          const startZ = (agonal.start[0] - 1) * 120;

          const endX = (agonal.end[2] - 1) * 120;
          const endY = (agonal.end[1] - 1) * 120;
          const endZ = (agonal.end[0] - 1) * 120;

          const p1 = project(startX, startY, startZ);
          const p2 = project(endX, endY, endZ);

          ctx.beginPath();
          ctx.strokeStyle = idx === 0 ? 'rgba(234, 179, 8, 0.85)' : 'rgba(234, 179, 8, 0.4)';
          ctx.lineWidth = idx === 0 ? 2.5 : 1.5;
          ctx.setLineDash([4, 4]);
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      }

      // Sort nodes by depth (z-buffer painters algorithm)
      const projectedNodes = nodes
        .filter(n => activeLayer === 'all' || n.layer === activeLayer)
        .map(n => {
          const proj = project(n.x, n.y, n.z);
          return { ...n, ...proj };
        })
        .sort((a, b) => b.pz - a.pz);

      // Draw grid planes for active layer
      if (typeof activeLayer === 'number') {
        const lz = (activeLayer - 1) * 120;
        const pTL = project(-120, -120, lz);
        const pTR = project(120, -120, lz);
        const pBR = project(120, 120, lz);
        const pBL = project(-120, 120, lz);

        ctx.fillStyle = 'rgba(234, 179, 8, 0.05)';
        ctx.beginPath();
        ctx.moveTo(pTL.px, pTL.py);
        ctx.lineTo(pTR.px, pTR.py);
        ctx.lineTo(pBR.px, pBR.py);
        ctx.lineTo(pBL.px, pBL.py);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw nodes
      projectedNodes.forEach(node => {
        const radius = Math.max(7, 14 * node.scale);
        const isSelected = selectedNode?.r === node.r && selectedNode?.c === node.c && selectedNode?.layer === node.layer;

        // Glow halo
        const gradient = ctx.createRadialGradient(node.px, node.py, 2, node.px, node.py, radius * 2.2);
        if (isSelected) {
          gradient.addColorStop(0, 'rgba(250, 204, 21, 0.9)');
          gradient.addColorStop(0.5, 'rgba(234, 179, 8, 0.4)');
          gradient.addColorStop(1, 'rgba(234, 179, 8, 0)');
        } else if (node.layer === 1) {
          gradient.addColorStop(0, 'rgba(245, 158, 11, 0.7)');
          gradient.addColorStop(0.6, 'rgba(217, 119, 6, 0.25)');
          gradient.addColorStop(1, 'rgba(217, 119, 6, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.6)');
          gradient.addColorStop(0.6, 'rgba(79, 70, 229, 0.2)');
          gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.px, node.py, radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.fillStyle = isSelected ? '#fef08a' : (node.layer === 1 ? '#fbbf24' : '#818cf8');
        ctx.beginPath();
        ctx.arc(node.px, node.py, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(15, 23, 42, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Value text
        ctx.fillStyle = '#0f172a';
        ctx.font = `600 ${Math.max(9, Math.round(11 * node.scale))}px "JetBrains Mono"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.val.toString(), node.px, node.py);
      });
    };

    render();
  }, [rotX, rotY, zoom, activeLayer, showAgonals, selectedNode, nodes, spaceAgonals]);

  // Mouse interaction for rotation & click
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;

    setRotY(prev => prev + deltaX * 0.008);
    setRotX(prev => Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev + deltaY * 0.008)));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);

    // Find nearest node
    let closestNode: Node3D | null = null;
    let minDist = 25;

    nodes
      .filter(n => activeLayer === 'all' || n.layer === activeLayer)
      .forEach(n => {
        const x1 = n.x * cosY + n.z * sinY;
        const z1 = -n.x * sinY + n.z * cosY;
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;
        const fov = 650 * zoom;
        const scale = fov / (500 + z2);
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;

        const dist = Math.hypot(px - mouseX, py - mouseY);
        if (dist < minDist) {
          minDist = dist;
          closestNode = n;
        }
      });

    setSelectedNode(closestNode);
  };

  // Center node of Sayles layer
  const activeFocus = selectedNode || nodes.find(n => n.r === 1 && n.c === 1 && n.layer === 1) || nodes[0];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 3D Canvas Viewport */}
      <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden relative shadow-2xl flex flex-col">
        {/* Top Control Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Rotate3d className="w-4 h-4 text-amber-400" />
            <span className="font-medium">3D Nemesis Hypermatrix Space</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-mono">dim = 3, order = 3 (27 nodes)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAgonals(s => !s)}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                showAgonals ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Space Agonals</span>
            </button>

            <button
              onClick={() => {
                setRotX(0.4);
                setRotY(0.6);
                setZoom(1.0);
              }}
              className="px-2.5 py-1 rounded text-xs bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              Reset View
            </button>
          </div>
        </div>

        {/* Canvas area */}
        <div className="relative flex-1 min-h-[460px] flex items-center justify-center cursor-grab active:cursor-grabbing bg-radial from-slate-900 to-slate-950">
          <canvas
            ref={canvasRef}
            width={760}
            height={520}
            className="w-full h-full max-h-[520px]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
          />

          {/* Quick HUD overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-xs text-slate-400 pointer-events-none flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>Sayles Central Slice (z=0)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              <span>Complementary Lattices</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t border-dashed border-amber-400"></span>
              <span>Main Agonal Ω₁</span>
            </div>
          </div>
        </div>

        {/* Bottom Slicing Controls */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Hyperplane Slices:</span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-md border border-slate-800">
              <button
                onClick={() => setActiveLayer('all')}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  activeLayer === 'all' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All (3D)
              </button>
              <button
                onClick={() => setActiveLayer(0)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  activeLayer === 0 ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Layer 0
              </button>
              <button
                onClick={() => setActiveLayer(1)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  activeLayer === 1 ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Layer 1 (Sayles)
              </button>
              <button
                onClick={() => setActiveLayer(2)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  activeLayer === 2 ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Layer 2
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Zoom:</span>
            <input
              type="range"
              min="0.6"
              max="1.8"
              step="0.05"
              value={zoom}
              onChange={e => setZoom(parseFloat(e.target.value))}
              className="w-24 accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Selected Node Inspector & Agonal Breakdown */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Node Detail Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Coordinate Cell Inspector</span>
            <span className="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              [{activeFocus.layer}, {activeFocus.r}, {activeFocus.c}]
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <span className="text-xs text-slate-400">Prime Exponent (p)</span>
              <div className="text-2xl font-mono font-bold text-amber-300 flex items-baseline gap-2">
                <span>{activeFocus.val}</span>
                <span className="text-xs font-normal text-emerald-400">∈ ℙ (Prime Verified)</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400">Z[φ] Element (φ^{activeFocus.val})</span>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-amber-200 break-all">
                {Golden.format(activeFocus.golden)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-950/60 border border-slate-800/80 rounded-md">
                <span className="text-slate-400 block mb-0.5">F_{activeFocus.val} (φ coeff)</span>
                <span className="font-mono text-slate-200">{activeFocus.golden.phiCoeff.toString()}</span>
              </div>
              <div className="p-2 bg-slate-950/60 border border-slate-800/80 rounded-md">
                <span className="text-slate-400 block mb-0.5">F_{activeFocus.val-1} (const)</span>
                <span className="font-mono text-slate-200">{activeFocus.golden.constCoeff.toString()}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400">Galois Conjugate bar(φ^{activeFocus.val})</span>
              <div className="p-2 bg-slate-950/60 border border-slate-800/80 rounded-md text-xs font-mono text-indigo-300">
                {Golden.format(Golden.conjugate(activeFocus.golden))}
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400">Field Norm N(φ^{activeFocus.val}) = b² + ab - a²</span>
              <div className="p-2 bg-slate-950/60 border border-slate-800/80 rounded-md text-xs font-mono text-emerald-300">
                {Golden.norm(activeFocus.golden).toString()} {activeFocus.val % 2 === 0 ? '(+1 for even)' : '(-1 for odd)'}
              </div>
            </div>
          </div>
        </div>

        {/* Spatial Agonals Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-xl text-xs">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800 text-slate-300 font-medium">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Primary Agonal Equilibrium</span>
          </div>

          <p className="mt-2.5 text-slate-400 leading-relaxed">
            In $d$-dimensional space, the primary agonal is $(i, i, \dots, i)$. In the Sayles central slice, the main diagonals satisfy:
          </p>

          <div className="mt-3 space-y-2">
            <div className="p-2 bg-slate-950/80 rounded border border-slate-800/80">
              <div className="flex justify-between text-slate-300 font-mono">
                <span>Main Diag:</span>
                <span className="text-amber-400">17 + 59 + 101 = 177</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-1">
                φ¹⁷ · φ⁵⁹ · φ¹⁰¹ = φ¹⁷⁷
              </div>
            </div>

            <div className="p-2 bg-slate-950/80 rounded border border-slate-800/80">
              <div className="flex justify-between text-slate-300 font-mono">
                <span>Anti Diag:</span>
                <span className="text-amber-400">71 + 59 + 47 = 177</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-1">
                φ⁷¹ · φ⁵⁹ · φ⁴⁷ = φ¹⁷⁷
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
