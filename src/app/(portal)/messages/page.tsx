"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Message = {
  id: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: { id: string; name: string; role: string };
  receiver: { id: string; name: string; role: string };
};

type User = { id: string; name: string; position: string | null; role: string };

export default function MessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const userId = (session?.user as any)?.id;

  useEffect(() => {
    loadMessages();
    fetch("/api/messages/users").then((r) => r.json()).then(setUsers);
  }, []);

  async function loadMessages() {
    const res = await fetch("/api/messages");
    setMessages(await res.json());
  }

  async function sendMessage() {
    if (!content.trim() || !selectedUser) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: selectedUser, content }),
    });
    setContent("");
    loadMessages();
  }

  async function markRead(id: string) {
    await fetch(`/api/messages/${id}`, { method: "PATCH" });
    loadMessages();
  }

  // Group messages by conversation partner
  const conversations = new Map<string, { user: User; messages: Message[]; unread: number }>();
  messages.forEach((m) => {
    const partnerId = m.sender.id === userId ? m.receiver.id : m.sender.id;
    const partner = m.sender.id === userId ? m.receiver : m.sender;
    if (!conversations.has(partnerId)) {
      conversations.set(partnerId, { user: partner as any, messages: [], unread: 0 });
    }
    const conv = conversations.get(partnerId)!;
    conv.messages.push(m);
    if (!m.read && m.receiver.id === userId) conv.unread++;
  });

  const activeConversation = selectedUser ? conversations.get(selectedUser) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {/* Conversations list */}
        <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-3 border-b border-border">
            <select
              onChange={(e) => { if (e.target.value) setSelectedUser(e.target.value); }}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm"
              value=""
            >
              <option value="">New conversation...</option>
              {users.filter((u) => u.id !== userId).map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
          <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
            {[...conversations.entries()].map(([id, conv]) => (
              <button
                key={id}
                onClick={() => {
                  setSelectedUser(id);
                  conv.messages.filter((m) => !m.read && m.receiver.id === userId).forEach((m) => markRead(m.id));
                }}
                className={`w-full p-3 text-left hover:bg-bg transition-colors ${selectedUser === id ? "bg-bg" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{conv.user.name}</p>
                  {conv.unread > 0 && (
                    <span className="bg-mav-gold text-black text-xs px-1.5 py-0.5 rounded-full">{conv.unread}</span>
                  )}
                </div>
                <p className="text-xs text-text-muted truncate">
                  {conv.messages[0]?.content}
                </p>
              </button>
            ))}
            {conversations.size === 0 && <p className="text-text-muted text-sm p-4">No conversations yet</p>}
          </div>
        </div>

        {/* Chat area */}
        <div className="md:col-span-2 bg-bg-card rounded-xl border border-border flex flex-col min-h-[60vh]">
          {selectedUser ? (
            <>
              <div className="p-3 border-b border-border">
                <p className="font-medium text-sm">
                  {activeConversation?.user.name || users.find((u) => u.id === selectedUser)?.name || "..."}
                </p>
              </div>
              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[50vh]">
                {(activeConversation?.messages || []).slice().reverse().map((m) => (
                  <div key={m.id} className={`flex ${m.sender.id === userId ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${
                      m.sender.id === userId ? "bg-mav-green text-white" : "bg-bg border border-border"
                    }`}>
                      {m.content}
                      <p className="text-xs opacity-60 mt-1">{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm"
                />
                <button onClick={sendMessage} className="bg-mav-green text-white px-4 py-2 rounded-lg text-sm">
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
              Select a conversation or start a new one
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
