"use client";
import { useEffect, useState } from "react";

type Drill = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  videoUrl: string | null;
  category: string;
  position: string | null;
  equipment: string | null;
  atHome: boolean;
  difficulty: string;
};

const categories = ["all", "tackling", "footwork", "agility", "conditioning", "catching", "blocking"];
const diffColors: Record<string, string> = {
  easy: "bg-green-500/20 text-green-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  hard: "bg-red-500/20 text-red-400",
};

export default function DrillsPage() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [category, setCategory] = useState("all");
  const [atHomeOnly, setAtHomeOnly] = useState(false);
  const [selected, setSelected] = useState<Drill | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (atHomeOnly) params.set("atHome", "true");
    fetch(`/api/drills?${params}`).then((r) => r.json()).then(setDrills);
  }, [category, atHomeOnly]);

  if (selected) {
    return (
      <div>
        <button onClick={() => setSelected(null)} className="text-mav-gold text-sm mb-4 hover:underline">← Back</button>
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-xs ${diffColors[selected.difficulty]}`}>{selected.difficulty}</span>
            <span className="text-xs text-text-muted capitalize">{selected.category}</span>
            {selected.atHome && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">🏠 At Home</span>}
          </div>
          <h1 className="text-2xl font-bold mb-2">{selected.title}</h1>
          <p className="text-text-muted mb-4">{selected.description}</p>
          {selected.equipment && (
            <div className="bg-bg-card rounded-lg border border-border p-3 mb-4">
              <p className="text-sm"><span className="text-text-muted">Equipment:</span> {selected.equipment}</p>
            </div>
          )}
          {selected.position && (
            <p className="text-sm text-text-muted mb-4">Position: {selected.position}</p>
          )}
          <div className="bg-bg-card rounded-xl border border-border p-4 mb-4">
            <h2 className="font-semibold mb-3">Instructions</h2>
            <div className="space-y-2">
              {selected.instructions.split("\n").map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-mav-gold font-bold text-sm mt-0.5">{i + 1}.</span>
                  <p className="text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>
          {selected.videoUrl && (
            <a href={selected.videoUrl} target="_blank" className="inline-block bg-mav-green text-white px-4 py-2 rounded-lg text-sm">
              Watch Video →
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Drill Library</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize ${category === c ? "bg-mav-green text-white" : "bg-bg-card border border-border text-text-muted"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 mb-6 text-sm text-text-muted cursor-pointer">
        <input type="checkbox" checked={atHomeOnly} onChange={(e) => setAtHomeOnly(e.target.checked)} className="accent-mav-green" />
        🏠 At-home drills only
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {drills.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelected(d)}
            className="bg-bg-card rounded-xl border border-border p-4 text-left hover:border-mav-green transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs ${diffColors[d.difficulty]}`}>{d.difficulty}</span>
              {d.atHome && <span className="text-xs">🏠</span>}
            </div>
            <h3 className="font-medium text-sm mb-1">{d.title}</h3>
            <p className="text-xs text-text-muted line-clamp-2">{d.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-text-muted capitalize">{d.category}</span>
              {d.equipment && <span className="text-xs text-text-muted">• {d.equipment}</span>}
            </div>
          </button>
        ))}
      </div>
      {drills.length === 0 && <p className="text-text-muted text-center mt-8">No drills found</p>}
    </div>
  );
}
