"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  _count: { questions: number };
};

type Question = {
  id: string;
  text: string;
  type: string;
  imageUrl: string | null;
  options: string;
  correctAnswer: string;
  explanation: string | null;
};

const diffColors: Record<string, string> = {
  easy: "bg-green-500/20 text-green-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  hard: "bg-red-500/20 text-red-400",
};

export default function QuizzesPage() {
  const { data: session } = useSession();
  const isCoach = (session?.user as any)?.role === "coach" || (session?.user as any)?.role === "admin";
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    fetch("/api/quizzes").then((r) => r.json()).then(setQuizzes);
  }, []);

  async function startQuiz(id: string) {
    const res = await fetch(`/api/quizzes/${id}`);
    const data = await res.json();
    setQuestions(data.questions);
    setActiveQuiz(id);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setFinished(false);
  }

  function submitAnswer() {
    if (!selected) return;
    const q = questions[current];
    const correct = selected === q.correctAnswer;
    if (correct) setScore((s) => s + 1);
    setShowResult(true);
  }

  async function nextQuestion() {
    if (current + 1 >= questions.length) {
      setFinished(true);
      await fetch("/api/quizzes/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: activeQuiz, score: score + (selected === questions[current].correctAnswer ? 0 : 0), totalQuestions: questions.length }),
      });
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
    setShowResult(false);
  }

  if (showBuilder && isCoach) return <QuizBuilder onDone={() => { setShowBuilder(false); fetch("/api/quizzes").then((r) => r.json()).then(setQuizzes); }} />;

  if (activeQuiz && !finished) {
    const q = questions[current];
    if (!q) return null;
    const options = JSON.parse(q.options) as string[];
    return (
      <div>
        <button onClick={() => setActiveQuiz(null)} className="text-mav-gold text-sm mb-4 hover:underline">← Back</button>
        <div className="bg-bg-card rounded-xl border border-border p-6 max-w-2xl mx-auto">
          <div className="flex justify-between text-sm text-text-muted mb-4">
            <span>Question {current + 1} of {questions.length}</span>
            <span>Score: {score}</span>
          </div>
          {q.imageUrl && <img src={q.imageUrl} alt="" className="w-full rounded-lg mb-4 max-h-64 object-contain" />}
          <h2 className="text-lg font-semibold mb-4">{q.text}</h2>
          <div className="space-y-2 mb-4">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => !showResult && setSelected(opt)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm ${
                  showResult
                    ? opt === q.correctAnswer
                      ? "border-green-500 bg-green-500/10 text-green-400"
                      : opt === selected
                      ? "border-red-500 bg-red-500/10 text-red-400"
                      : "border-border"
                    : opt === selected
                    ? "border-mav-gold bg-mav-gold/10"
                    : "border-border hover:border-mav-green"
                }`}
                disabled={showResult}
              >
                {opt}
              </button>
            ))}
          </div>
          {showResult && q.explanation && (
            <p className="text-sm text-text-muted bg-bg rounded-lg p-3 mb-4">{q.explanation}</p>
          )}
          {!showResult ? (
            <button onClick={submitAnswer} disabled={!selected} className="w-full bg-mav-green text-white py-2.5 rounded-lg disabled:opacity-50">
              Submit Answer
            </button>
          ) : (
            <button onClick={nextQuestion} className="w-full bg-mav-gold text-black py-2.5 rounded-lg font-medium">
              {current + 1 >= questions.length ? "Finish Quiz" : "Next Question"}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="text-6xl mb-4">{score / questions.length >= 0.7 ? "🎉" : "📚"}</div>
        <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
        <p className="text-4xl font-bold mb-2">
          <span className={score / questions.length >= 0.7 ? "text-green-400" : "text-red-400"}>
            {score}/{questions.length}
          </span>
        </p>
        <p className="text-text-muted mb-6">{Math.round((score / questions.length) * 100)}% correct</p>
        <button onClick={() => setActiveQuiz(null)} className="bg-mav-green text-white px-6 py-2.5 rounded-lg">
          Back to Quizzes
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        {isCoach && (
          <button onClick={() => setShowBuilder(true)} className="bg-mav-green text-white px-4 py-2 rounded-lg text-sm">
            + Create Quiz
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((q) => (
          <div key={q.id} className="bg-bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs ${diffColors[q.difficulty]}`}>{q.difficulty}</span>
              <span className="text-xs text-text-muted capitalize">{q.category}</span>
            </div>
            <h3 className="font-semibold mb-1">{q.title}</h3>
            {q.description && <p className="text-sm text-text-muted mb-3">{q.description}</p>}
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">{q._count.questions} questions</span>
              <button onClick={() => startQuiz(q.id)} className="bg-mav-green text-white px-3 py-1.5 rounded-lg text-sm hover:bg-mav-green-light">
                Start Quiz
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizBuilder({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("defense");
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState<{ text: string; options: string[]; correctAnswer: string; explanation: string }[]>([
    { text: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" },
  ]);

  function updateQuestion(idx: number, field: string, value: any) {
    const updated = [...questions];
    (updated[idx] as any)[field] = value;
    setQuestions(updated);
  }

  function updateOption(qIdx: number, oIdx: number, value: string) {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  }

  async function submit() {
    const res = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category, difficulty, questions }),
    });
    if (res.ok) onDone();
  }

  return (
    <div>
      <button onClick={onDone} className="text-mav-gold text-sm mb-4 hover:underline">← Back</button>
      <h1 className="text-2xl font-bold mb-6">Create Quiz</h1>
      <div className="max-w-2xl space-y-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quiz title" className="w-full bg-bg-card border border-border rounded-lg px-3 py-2.5 text-sm" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full bg-bg-card border border-border rounded-lg px-3 py-2.5 text-sm" />
        <div className="flex gap-3">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-bg-card border border-border rounded-lg px-3 py-2 text-sm">
            <option value="defense">Defense</option>
            <option value="offense">Offense</option>
            <option value="special_teams">Special Teams</option>
            <option value="general">General</option>
          </select>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="bg-bg-card border border-border rounded-lg px-3 py-2 text-sm">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {questions.map((q, qi) => (
          <div key={qi} className="bg-bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 className="font-medium text-sm">Question {qi + 1}</h3>
            <input value={q.text} onChange={(e) => updateQuestion(qi, "text", e.target.value)} placeholder="Question text" className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm" />
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === opt && opt !== ""} onChange={() => updateQuestion(qi, "correctAnswer", opt)} />
                <input value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
            <input value={q.explanation} onChange={(e) => updateQuestion(qi, "explanation", e.target.value)} placeholder="Explanation (optional)" className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
        ))}
        <button onClick={() => setQuestions([...questions, { text: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" }])} className="text-mav-gold text-sm">+ Add Question</button>
        <button onClick={submit} className="w-full bg-mav-green text-white py-2.5 rounded-lg font-medium">Create Quiz</button>
      </div>
    </div>
  );
}
