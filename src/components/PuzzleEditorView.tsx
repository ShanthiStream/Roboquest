import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { GameEntity, LevelDefinition, TileType } from '../game/types';
import { PuzzleEncoder } from '../editor/PuzzleEncoder';
import { Play, Share2, Check, AlertCircle, ArrowLeft, Plus } from 'lucide-react';

export const PuzzleEditorView: React.FC = () => {
  const { setMode, loadCustomLevel } = useGameStore();

  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(8);
  const [title, setTitle] = useState('My Custom Laboratory');
  const [description, setDescription] = useState('Can you navigate through this laboratory puzzle?');

  const [activeTool, setActiveTool] = useState<
    'floor' | 'wall' | 'hazard' | 'charging-pad' | 'battery' | 'key-blue' | 'door-blue' | 'crate' | 'exit' | 'robot-start'
  >('wall');

  const [tiles, setTiles] = useState<TileType[][]>(() => {
    const grid: TileType[][] = [];
    for (let y = 0; y < 8; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < 8; x++) {
        if (x === 0 || x === 7 || y === 0 || y === 7) row.push('wall');
        else row.push('floor');
      }
      grid.push(row);
    }
    return grid;
  });

  const [robotStart, setRobotStart] = useState({ x: 1, y: 1 });
  const [entities, setEntities] = useState<GameEntity[]>([
    { id: 'custom-exit', type: 'exit', x: 6, y: 6 },
    { id: 'custom-bat-1', type: 'battery', x: 3, y: 3, energyValue: 25 },
  ]);

  const [copiedLink, setCopiedLink] = useState(false);
  const [importInput, setImportInput] = useState('');

  const handleTileClick = (x: number, y: number) => {
    // Cannot edit outer perimeter walls
    if (x === 0 || x === width - 1 || y === 0 || y === height - 1) return;

    if (activeTool === 'robot-start') {
      setRobotStart({ x, y });
      return;
    }

    if (activeTool === 'floor' || activeTool === 'wall' || activeTool === 'hazard' || activeTool === 'charging-pad') {
      const nextTiles = tiles.map((row, ry) =>
        row.map((cell, rx) => (rx === x && ry === y ? (activeTool as TileType) : cell))
      );
      setTiles(nextTiles);
      // Remove any entity on a wall
      if (activeTool === 'wall') {
        setEntities(entities.filter((e) => !(e.x === x && e.y === y)));
      }
      return;
    }

    // Entity placements
    setEntities((prev) => {
      const filtered = prev.filter((e) => !(e.x === x && e.y === y));
      if (activeTool === 'battery') {
        return [...filtered, { id: `bat-${Date.now()}`, type: 'battery', x, y, energyValue: 20 }];
      } else if (activeTool === 'key-blue') {
        return [...filtered, { id: `key-blue-${Date.now()}`, type: 'key', color: 'blue', x, y }];
      } else if (activeTool === 'door-blue') {
        return [...filtered, { id: `door-blue-${Date.now()}`, type: 'door', color: 'blue', x, y, isOpen: false }];
      } else if (activeTool === 'crate') {
        return [...filtered, { id: `crate-${Date.now()}`, type: 'crate', x, y }];
      } else if (activeTool === 'exit') {
        return [...filtered.filter((e) => e.type !== 'exit'), { id: `exit-${Date.now()}`, type: 'exit', x, y }];
      }
      return filtered;
    });
  };

  const constructLevelDefinition = (): LevelDefinition => ({
    id: 888,
    title: title || 'Custom Laboratory',
    difficulty: 'Medium',
    description: description || 'Player-created community puzzle.',
    mapSize: { width, height },
    tiles,
    robotStart: {
      x: robotStart.x,
      y: robotStart.y,
      direction: 'right',
      energy: 100,
    },
    entities,
    hints: [
      'Study the custom layout of walls and corridors.',
      'Collect all required items before moving to the portal.',
      'Plan your command sequence step-by-step.',
    ],
    parCommands: 4,
    parSteps: 12,
    verifiedSolution: ['move forward 3'],
  });

  const handleTestPlay = () => {
    const levelDef = constructLevelDefinition();
    loadCustomLevel(levelDef);
  };

  const handleShare = () => {
    const levelDef = constructLevelDefinition();
    const encoded = PuzzleEncoder.encode(levelDef);
    const fullUrl = `${window.location.origin}?puzzle=${encoded}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleImport = () => {
    if (!importInput.trim()) return;
    let code = importInput.trim();
    if (code.includes('?puzzle=')) {
      code = code.split('?puzzle=')[1];
    }
    const decoded = PuzzleEncoder.decode(code);
    if (decoded) {
      setTitle(decoded.title);
      setDescription(decoded.description);
      setWidth(decoded.mapSize.width);
      setHeight(decoded.mapSize.height);
      setTiles(decoded.tiles);
      setRobotStart({ x: decoded.robotStart.x, y: decoded.robotStart.y });
      setEntities(decoded.entities);
      setImportInput('');
      alert('Custom puzzle imported successfully!');
    } else {
      alert('Invalid or corrupted puzzle code.');
    }
  };

  const isSolvable = PuzzleEncoder.checkSolvability(constructLevelDefinition());

  return (
    <div className="flex-1 w-full flex flex-col p-4 max-w-6xl mx-auto overflow-y-auto">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-cyan-500/20">
        <button
          onClick={() => setMode('story')}
          className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Story</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-900 border border-slate-700">
            {isSolvable ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Solvable Path Verified
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Exit Path Blocked
              </span>
            )}
          </div>

          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-xl border border-cyan-500/50 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/40 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
          </button>

          <button
            onClick={handleTestPlay}
            className="px-5 py-2 rounded-xl neon-button text-xs font-orbitron font-bold flex items-center gap-1.5 shadow-lg"
          >
            <Play className="w-3.5 h-3.5" />
            <span>TEST PLAY</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Palette & Inspector */}
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl">
            <h3 className="font-orbitron text-xs font-bold tracking-wider text-cyan-400 uppercase mb-3">
              Tile & Object Palette
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'floor', label: 'Floor' },
                { id: 'wall', label: 'Wall' },
                { id: 'hazard', label: 'Hazard' },
                { id: 'charging-pad', label: 'Charger' },
                { id: 'battery', label: 'Battery' },
                { id: 'key-blue', label: 'Blue Key' },
                { id: 'door-blue', label: 'Blue Door' },
                { id: 'crate', label: 'Crate' },
                { id: 'exit', label: 'Portal Exit' },
                { id: 'robot-start', label: 'Robot Start' },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as any)}
                  className={`p-2 rounded-xl border text-left font-mono transition ${
                    activeTool === tool.id
                      ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl space-y-3 text-xs">
            <h3 className="font-orbitron text-xs font-bold tracking-wider text-cyan-400 uppercase">
              Mission Metadata
            </h3>
            <div>
              <label className="text-slate-400 block mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400 text-xs"
              />
            </div>
          </div>

          {/* Import Code Box */}
          <div className="glass-panel p-4 rounded-2xl space-y-2 text-xs">
            <h3 className="font-orbitron text-xs font-bold tracking-wider text-cyan-400 uppercase">
              Import Shared Puzzle
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder="Paste puzzle code or link..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs outline-none focus:border-cyan-400 font-mono"
              />
              <button
                onClick={handleImport}
                className="px-3 py-1.5 rounded-lg border border-cyan-500/50 bg-cyan-950/60 text-cyan-300 font-semibold"
              >
                Import
              </button>
            </div>
          </div>
        </div>

        {/* Center/Right: Interactive Grid */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center glass-panel p-6 rounded-3xl overflow-auto min-h-[460px]">
          <div
            className="grid gap-1 bg-slate-950 p-3 rounded-2xl border border-slate-800 shadow-2xl"
            style={{
              gridTemplateColumns: `repeat(${width}, minmax(44px, 52px))`,
            }}
          >
            {tiles.map((row, y) =>
              row.map((cell, x) => {
                const isRobot = robotStart.x === x && robotStart.y === y;
                const entity = entities.find((e) => e.x === x && e.y === y);

                return (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleTileClick(x, y)}
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-lg border flex items-center justify-center font-bold text-xs select-none cursor-pointer transition relative ${
                      cell === 'wall'
                        ? 'bg-slate-800 border-slate-700 text-slate-500'
                        : cell === 'hazard'
                        ? 'bg-rose-950/60 border-rose-600/60 text-rose-300'
                        : cell === 'charging-pad'
                        ? 'bg-teal-950/60 border-teal-500/60 text-teal-300'
                        : 'bg-slate-900/90 border-slate-800/80 hover:border-cyan-500/50'
                    }`}
                  >
                    {isRobot && <span className="text-xl drop-shadow">🤖</span>}
                    {!isRobot && entity && (
                      <span className="text-base">
                        {entity.type === 'battery'
                          ? '⚡'
                          : entity.type === 'key'
                          ? '🔑'
                          : entity.type === 'door'
                          ? '🚪'
                          : entity.type === 'crate'
                          ? '📦'
                          : '🌀'}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <p className="text-xs text-slate-500 mt-4 font-mono">
            Click any tile to paint selected palette element. Outer wall ring is fixed.
          </p>
        </div>
      </div>
    </div>
  );
};
