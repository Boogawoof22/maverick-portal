"use client";
import { useEffect, useState } from "react";

type Flashcard = {
  id: string;
  front: string;
  back: string;
  category: string | null;
  mastered: boolean;
};

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [studyMode, setStudyMode] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("all");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => { loadCards(); }, []);

  async function loadCards() {
    const res = await fetch("/api/flashcards");
    setCards(await res.json());
  }

  async function createCard() {
    await fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ front, back, category: category || null }),
    });
    setFront(""); setBack(""); setCategory("");
    setShowCreate(false);
    loadCards();
  }

  async function toggleMastered(id: string, mastered: boolean) {
    await fetch(`/api/flashcards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mastered }),
    });
    loadCards();
  }

  const filteredCards = filter === "all" ? cards : filter === "unmastered" ? cards.filter((c) => !c.mastered) : cards.filter((c) => c.category === filter);
  const categories = [...new Set(cards.map((c) => c.category).filter(Boolean))];

  // Study mode: show unmastered first, then mastered
  const studyCards = [...filteredCards].sort((a, b) => (a.mastered === b.mastered ? 0 : a.mastered ? 1 : -1));

  if (studyMode && studyCards.length > 0) {
    const card = studyCards[currentIdx % studyCards.length];
    return (
      <div>
        <button onClick={() => setStudyMode(false)} className="text-mav-gold text-sm mb-4 hover:underline">← Back</button>
        <div className="max-w-md mx-auto">
          <p className="text-sm text-text-muted text-center mb-4">
            Card {(currentIdx % studyCards.length) + 1} of {studyCards.length}
          </p>
          <button
            onClick={() => setFlipped(!flipped)}
            className="w-full bg-bg-card rounded-xl border border-border p-8 min-h-[250px] flex items-center justify-center text-center transition-all hover:border-mav-green"
          >
            <div>
              <p className="text-xs text-text-muted mb-2">{flipped ? "ANSWER" : "QUESTION"}</p>
              <p className="text-lg font-medium">{flipped ? card.back : card.front}</p>
            </div>
          </button>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => { toggleMastered(card.id, false); setFlipped(false); setCurrentIdx((i) => i + 1); }}
              className="flex-1 bg-red-500/20 text-red-400 py-2.5 rounded-lg text-sm"
            >
              ✗ Not Yet
            </button>
            <button
              onClick={() => { toggleMastered(card.id, true); setFlipped(false); setCurrentIdx((i) => i + 1); }}
              className="flex-1 bg-green-500/20 text-green-400 py-2.5 rounded-lg text-sm"
            >
              ✓ Got It
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Flashcards</h1>
        <div className="flex gap-2">
          <button onClick={() => { setStudyMode(true); setCurrentIdx(0); setFlipped(false); }} className="bg-mav-gold text-black px-4 py-2 rounded-lg text-sm font-medium">
            Study Mode
          </button>
          <button onClick={() => setShowCreate(true)} className="bg-mav-green text-white px-4 py-2 rounded-lg text-sm">
            + Create
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg text-sm ${filter === "all" ? "bg-mav-green text-white" : "bg-bg-card border border-border text-text-muted"}`}>All</button>
        <button onClick={() => setFilter("unmastered")} className={`px-3 py-1.5 rounded-lg text-sm ${filter === "unmastered" ? "bg-mav-green text-white" : "bg-bg-card border border-border text-text-muted"}`}>Unmastered</button>
        {categories.map((c) => (
          <button key={c} onClick={() => setFilter(c!)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === c ? "bg-mav-green text-white" : "bg-bg-card border border-border text-text-muted"}`}>{c}</button>
        ))}
      </div>

      {showCreate && (
        <div className="bg-bg-card rounded-xl border border-border p-4 mb-6 max-w-md space-y-3">
          <input value={front} onChange={(e) => setFront(e.target.value)} placeholder="Front (question/term)" className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm" />
          <textarea value={back} onChange={(e) => setBack(e.target.value)} placeholder="Back (answer/definition)" className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm" rows={3} />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (optional)" className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button onClick={createCard} className="bg-mav-green text-white px-4 py-2 rounded-lg text-sm">Save</button>
            <button onClick={() => setShowCreate(false)} className="text-text-muted text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card) => (
          <div key={card.id} className={`bg-bg-card rounded-xl border p-4 ${card.mastered ? "border-green-500/30" : "border-border"}`}>
            <div className="flex items-start justify-between mb-2">
              {card.category && <span className="text-xs text-text-muted bg-bg px-2 py-0.5 rounded">{card.category}</span>}
              {card.mastered && <span className="text-xs text-green-400">✓ Mastered</span>}
            </div>
            <p className="font-medium text-sm mb-1">{card.front}</p>
            <p className="text-sm text-text-muted">{card.back}</p>
          </div>
        ))}
      </div>
      {filteredCards.length === 0 && <p className="text-text-muted text-center mt-8">No flashcards yet. Create some!</p>}
    </div>
  );
}
