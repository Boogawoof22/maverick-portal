"use client";
import { useEffect, useState } from "react";

type Video = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail: string | null;
  category: string;
  position: string | null;
  createdAt: string;
};

const categories = ["all", "game_film", "scout_film", "drill", "highlight", "tutorial"];
const positions = ["all", "QB", "RB", "WR", "OL", "DL", "LB", "CB", "SS", "FS"];

const categoryColors: Record<string, string> = {
  game_film: "bg-blue-500/20 text-blue-400",
  scout_film: "bg-purple-500/20 text-purple-400",
  drill: "bg-green-500/20 text-green-400",
  highlight: "bg-yellow-500/20 text-yellow-400",
  tutorial: "bg-cyan-500/20 text-cyan-400",
};

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [category, setCategory] = useState("all");
  const [position, setPosition] = useState("all");
  const [selected, setSelected] = useState<Video | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (position !== "all") params.set("position", position);
    fetch(`/api/videos?${params}`).then((r) => r.json()).then(setVideos);
  }, [category, position]);

  if (selected) {
    return (
      <div>
        <button onClick={() => setSelected(null)} className="text-mav-gold text-sm mb-4 hover:underline">
          ← Back to Videos
        </button>
        <h1 className="text-2xl font-bold mb-2">{selected.title}</h1>
        <span className={`inline-block px-2 py-0.5 rounded text-xs mb-4 ${categoryColors[selected.category] || ""}`}>
          {selected.category.replace("_", " ")}
        </span>
        <div className="bg-black rounded-xl overflow-hidden aspect-video mb-4">
          {selected.url.includes("youtube") || selected.url.includes("youtu.be") ? (
            <iframe
              src={selected.url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
              className="w-full h-full"
              allowFullScreen
            />
          ) : (
            <video src={selected.url} controls className="w-full h-full" />
          )}
        </div>
        {selected.description && <p className="text-text-muted">{selected.description}</p>}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Video Library</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
              category === c ? "bg-mav-green text-white" : "bg-bg-card border border-border text-text-muted hover:text-text"
            }`}
          >
            {c.replace("_", " ")}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {positions.map((p) => (
          <button
            key={p}
            onClick={() => setPosition(p)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              position === p ? "bg-mav-gold text-black" : "bg-bg-card border border-border text-text-muted hover:text-text"
            }`}
          >
            {p === "all" ? "All Positions" : p}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelected(v)}
            className="bg-bg-card rounded-xl border border-border overflow-hidden hover:border-mav-green transition-colors text-left"
          >
            <div className="aspect-video bg-mav-green-dark flex items-center justify-center text-4xl">🎬</div>
            <div className="p-3">
              <span className={`inline-block px-2 py-0.5 rounded text-xs mb-2 ${categoryColors[v.category] || ""}`}>
                {v.category.replace("_", " ")}
              </span>
              <h3 className="font-medium text-sm">{v.title}</h3>
              {v.position && <p className="text-xs text-text-muted mt-1">{v.position}</p>}
            </div>
          </button>
        ))}
        {videos.length === 0 && <p className="text-text-muted col-span-full">No videos found</p>}
      </div>
    </div>
  );
}
