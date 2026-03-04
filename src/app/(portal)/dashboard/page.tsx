import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as any;
  const isCoach = user?.role === "coach" || user?.role === "admin";

  if (isCoach) {
    const [players, recentAttempts, pendingAssignments] = await Promise.all([
      prisma.user.findMany({ where: { role: "player" }, orderBy: { name: "asc" } }),
      prisma.quizAttempt.findMany({
        take: 10,
        orderBy: { completedAt: "desc" },
        include: { user: true, quiz: true },
      }),
      prisma.assignment.count({ where: { completed: false } }),
    ]);

    return (
      <div>
        <h1 className="text-2xl font-bold mb-1">Coach Dashboard</h1>
        <p className="text-text-muted mb-6">Welcome back, {user?.name}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Players" value={players.length} icon="🏈" />
          <StatCard label="Pending Tasks" value={pendingAssignments} icon="📋" />
          <StatCard label="Recent Quizzes" value={recentAttempts.length} icon="📝" />
          <Link href="/assignments" className="bg-mav-green rounded-xl p-4 flex flex-col items-center justify-center hover:bg-mav-green-light transition-colors">
            <span className="text-2xl mb-1">➕</span>
            <span className="text-sm font-medium text-white">Assign Work</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-bg-card rounded-xl border border-border p-4">
            <h2 className="font-semibold mb-3">Team Roster</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {players.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-8 h-8 rounded-full bg-mav-green-dark flex items-center justify-center text-sm font-bold text-white">
                    {p.jerseyNumber || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-text-muted">{p.position || "No position"}</p>
                  </div>
                </div>
              ))}
              {players.length === 0 && <p className="text-text-muted text-sm">No players yet</p>}
            </div>
          </div>

          <div className="bg-bg-card rounded-xl border border-border p-4">
            <h2 className="font-semibold mb-3">Recent Quiz Scores</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentAttempts.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{a.user.name}</p>
                    <p className="text-xs text-text-muted">{a.quiz.title}</p>
                  </div>
                  <span className={`text-sm font-bold ${a.score / a.totalQuestions >= 0.7 ? "text-green-400" : "text-red-400"}`}>
                    {a.score}/{a.totalQuestions}
                  </span>
                </div>
              ))}
              {recentAttempts.length === 0 && <p className="text-text-muted text-sm">No quiz attempts yet</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Player dashboard
  const [assignments, recentScores] = await Promise.all([
    prisma.assignment.findMany({
      where: { playerId: user?.id, completed: false },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.quizAttempt.findMany({
      where: { userId: user?.id },
      orderBy: { completedAt: "desc" },
      take: 5,
      include: { quiz: true },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name}</h1>
      <p className="text-text-muted mb-6">{user?.position || "Player"} • Mavericks</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/quizzes" className="bg-bg-card rounded-xl border border-border p-4 hover:border-mav-green transition-colors">
          <span className="text-2xl">📝</span>
          <p className="text-sm font-medium mt-2">Quizzes</p>
        </Link>
        <Link href="/playbook" className="bg-bg-card rounded-xl border border-border p-4 hover:border-mav-green transition-colors">
          <span className="text-2xl">📋</span>
          <p className="text-sm font-medium mt-2">Playbook</p>
        </Link>
        <Link href="/flashcards" className="bg-bg-card rounded-xl border border-border p-4 hover:border-mav-green transition-colors">
          <span className="text-2xl">🃏</span>
          <p className="text-sm font-medium mt-2">Flashcards</p>
        </Link>
        <Link href="/drills" className="bg-bg-card rounded-xl border border-border p-4 hover:border-mav-green transition-colors">
          <span className="text-2xl">🏋️</span>
          <p className="text-sm font-medium mt-2">Drills</p>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-bg-card rounded-xl border border-border p-4">
          <h2 className="font-semibold mb-3">Pending Assignments</h2>
          <div className="space-y-2">
            {assignments.map((a) => (
              <Link key={a.id} href="/assignments" className="block py-2 border-b border-border last:border-0 hover:text-mav-gold transition-colors">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-text-muted">
                  {a.dueDate ? `Due ${new Date(a.dueDate).toLocaleDateString()}` : "No due date"}
                </p>
              </Link>
            ))}
            {assignments.length === 0 && <p className="text-text-muted text-sm">All caught up! 🎉</p>}
          </div>
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-4">
          <h2 className="font-semibold mb-3">Recent Scores</h2>
          <div className="space-y-2">
            {recentScores.map((s) => (
              <div key={s.id} className="flex justify-between py-2 border-b border-border last:border-0">
                <p className="text-sm">{s.quiz.title}</p>
                <span className={`text-sm font-bold ${s.score / s.totalQuestions >= 0.7 ? "text-green-400" : "text-red-400"}`}>
                  {Math.round((s.score / s.totalQuestions) * 100)}%
                </span>
              </div>
            ))}
            {recentScores.length === 0 && <p className="text-text-muted text-sm">No quiz attempts yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-4">
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}
