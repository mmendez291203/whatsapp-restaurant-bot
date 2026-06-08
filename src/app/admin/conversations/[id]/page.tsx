"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  phoneNumber: string;
  status: string;
  messages: Message[];
  reservation: {
    guestName: string;
    date: string;
    time: string;
    partySize: number;
    status: string;
  } | null;
}

export default function ConversationDetailPage() {
  const { id } = useParams();
  const [conversation, setConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    fetch(`/api/conversations/${id}`)
      .then((r) => r.json())
      .then(setConversation);
  }, [id]);

  if (!conversation) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/conversations" className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{conversation.phoneNumber}</h1>
        <span className="text-sm text-gray-500 capitalize">{conversation.status}</span>
      </div>

      {conversation.reservation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-900 mb-2">Reserva</h2>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
            <span>Nombre: {conversation.reservation.guestName}</span>
            <span>Fecha: {conversation.reservation.date}</span>
            <span>Hora: {conversation.reservation.time}</span>
            <span>Personas: {conversation.reservation.partySize}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {conversation.messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-lg px-4 py-2 rounded-2xl text-sm ${
                m.role === "user"
                  ? "bg-white border border-gray-200 text-gray-800"
                  : "bg-blue-600 text-white"
              }`}
            >
              <p>{m.content}</p>
              <p className={`text-xs mt-1 ${m.role === "user" ? "text-gray-400" : "text-blue-200"}`}>
                {new Date(m.createdAt).toLocaleTimeString("es-CR")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
