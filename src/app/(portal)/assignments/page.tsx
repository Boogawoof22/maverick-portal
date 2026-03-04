"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  player?: { name: string; position: string | null };
  coach?: { name: string };
};

type Player = { id: string; name: string; position: string | null };

const typeIcons: Record<string, string> = {
  quiz: "📝",
  playbook_review: "📋",
  video_watch: "🎬",
  drill: "🏋️",
};

export default function AssignmentsPage() {
  const { data: session } = useSession();
  const isCoach = (session?.user as any)?.role === "coach" || (session?.user as any)?.role === "admin";
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [form, setForm] = useState({ title: "", description: "", type: "quiz", playerId: "", dueDate: "" });

  useEffect(() => {
    loadAssignments();
    if (isCoach) fetch("/api/players").then((r) => r.json()).then(setPlayers);
  }, [isCoach]);

  async function loadAssignments() {
    const res = await fetch("/api/assignments");
    setAssignments(await res.json());
  }

  async function createAssignment() {
    await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, dueDate: form.dueDate || null }),
    });
    setShowCreate(false);
    setForm({ title: "", description: "", type: "quiz", playerId: "", dueDate: "" });
    loadAssignments();
  }

  async function markComplete(id: string) {
    await fetch(`/api/assignments/${id}`, { method: "PATCH" });
    loadAssignments();
  }

  const pending = assignments.filter((a) => !a.completed);
  const completed = assignments.filter((a) => a.completed);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Assignments</h1>
        {isCoach && (
          <button onClick={() => setShowCreate(!showCreate)} className="bg-mav-green text-white px-4 py-2 rounded-lg text-sm">
            + Assign Work
          </button>
        )}
      </div>

      {showCreate && (
        <div className="bg-bg-card rounded-xl border border-border p-4 mb-6 max-w-md space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm" />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm">
            <option value="quiz">Quiz</option>
            <option value="playbook_review">Playbook Review</option>
            <option value="video_watch">Video Watch</option>
            <option value="drill">Drill</option>
          </select>
          <select value={form.playerId} onChange={(e) => setForm({ ...form, playerId: e.target.value })} className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm">
            <option value="">Select player</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.position || "N/A"})</option>
            ))}
          </select>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm" />
          <button onClick={createAssignment} className="w-full bg-mav-green text-white py-2 rounded-lg text-sm">Create Assignment</button>
        </div>
      )}

      <div className="mb-8">
        <h2 className="font-semibold mb-3 text-mav-gold">Pending ({pending.length})</h2>
        <div className="space-y-3">
          {pending.map((a) => (
            <div key={a.id} className="bg-bg-card rounded-xl border border-border p-4 flex items-center gap-4">
              <span className="text-2xl">{typeIcons[a.type] || "📌"}</span>
              <div className="flex-1">
                <h3 className="font-medium text-sm">{a.title}</h3>
                <p className="text-xs text-text-muted">
                  {isCoach && a.player ? `${a.player.name} • ` : ""}
                  {a.type.replace("_", " ")}
                  {a.dueDate ? ` • Due ${new Date(a.dueDate).toLocaleDateString()}` : ""}
                </p>
              </div>
              {!isCoach && (
                <button onClick={() => markComplete(a.id)} className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-xs">
                  Mark Done ✓
                </button>
              )}
            </div>
          ))}
          {pending.length === 0 && <p className="text-text-muted text-sm">No pending assignments</p>}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3 text-text-muted">Completed ({completed.length})</h2>
        <div className="space-y-3">
          {completed.map((a) => (
            <div key={a.id} className="bg-bg-card rounded-xl border border-green-500/20 p-4 flex items-center gap-4 opacity-70">
              <span className="text-2xl">{typeIcons[a.type] || "📌"}</span>
              <div className="flex-1">
                <h3 className="font-medium text-sm line-through">{a.title}</h3>
                <p className="text-xs text-text-muted">
                  Completed {a.completedAt ? new Date(a.completedAt).toLocaleDateString() : ""}
                </p>
              </div>
              <span className="text-green-400 text-sm">✓</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
