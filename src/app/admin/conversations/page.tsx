"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Conversation {
  id: string;
  phoneNumber: string;
  status: string;
  updatedAt: string;
  messages: { content: string; role: string }[];
  reservation: { guestName: string; date: string; time: string; partySize: number } | null;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  escalated: "bg-red-100 text-red-700",
  closed: "bg-gray-100 text-gray-600",
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => {
        setConversations(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Conversaciones</h1>
      {conversations.length === 0 ? (
        <p className="text-gray-500">No hay conversaciones aún.</p>
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/admin/conversations/${c.id}`}
              className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">{c.phoneNumber}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {c.status}
                </span>
              </div>
              {c.messages[0] && (
                <p className="text-sm text-gray-500 truncate">{c.messages[0].content}</p>
              )}
              {c.reservation && (
                <p className="text-xs text-blue-600 mt-1">
                  Reserva: {c.reservation.guestName} — {c.reservation.date} {c.reservation.time} ({c.reservation.partySize} personas)
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(c.updatedAt).toLocaleString("es-CR")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}