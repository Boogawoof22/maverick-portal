"use client";
import { useEffect, useState } from "react";

type Playbook = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  category: string;
  section: string | null;
};

const tabs = ["defense", "offense", "special_teams"];

export default function PlaybookPage() {
  const [items, setItems] = useState<Playbook[]>([]);
  const [tab, setTab] = useState("defense");
  const [selected, setSelected] = useState<Playbook | null>(null);
  const [readItems, setReadItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/playbook?category=${tab}`).then((r) => r.json()).then(setItems);
  }, [tab]);

  useEffect(() => {
    const saved = localStorage.getItem("playbook-read");
    if (saved) setReadItems(new Set(JSON.parse(saved)));
  }, []);

  function markRead(id: string) {
    const updated = new Set(readItems);
    updated.add(id);
    setReadItems(updated);
    localStorage.setItem("playbook-read", JSON.stringify([...updated]));
  }

  if (selected) {
    return (
      <div>
        <button onClick={() => { setSelected(null); markRead(selected.id); }} className="text-mav-gold text-sm mb-4 hover:underline">
          ← Back to Playbook
        </button>
        <h1 className="text-2xl font-bold mb-4">{selected.title}</h1>
        {selected.description && <p className="text-text-muted mb-4">{selected.description}</p>}
        <div className="bg-bg-card rounded-xl border border-border p-4">
          {selected.fileUrl.endsWith(".pdf") ? (
            <iframe src={selected.fileUrl} className="w-full h-[80vh] rounded-lg" />
          ) : (
            <img src={selected.fileUrl} alt={selected.title} className="w-full rounded-lg" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Playbook</h1>
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              tab === t ? "bg-mav-green text-white" : "bg-bg-card border border-border text-text-muted"
            }`}
          >
            {t.replace("_", " ")}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className="w-full bg-bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:border-mav-green transition-colors text-left"
          >
            <div className="text-3xl">📄</div>
            <div className="flex-1">
              <h3 className="font-medium">{item.title}</h3>
              {item.section && <p className="text-xs text-text-muted capitalize">{item.section}</p>}
              {item.description && <p className="text-sm text-text-muted mt-1">{item.description}</p>}
            </div>
            {readItems.has(item.id) && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Read ✓</span>
            )}
          </button>
        ))}
        {items.length === 0 && <p className="text-text-muted">No playbook entries for this category</p>}
      </div>
    </div>
  );
}
