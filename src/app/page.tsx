import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="space-y-3">
          <div className="text-5xl">🍝</div>
          <h1 className="text-4xl font-bold tracking-tight">La Trattoria</h1>
          <p className="text-zinc-400 text-lg">
            Bot de WhatsApp con IA — responde preguntas, gestiona reservas y escala a humanos cuando es necesario.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/admin/conversations"
            className="flex items-center justify-center gap-2 bg-white text-zinc-950 font-semibold px-6 py-3 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <span>💬</span> Conversaciones
          </Link>
          <Link
            href="/admin/config"
            className="flex items-center justify-center gap-2 border border-zinc-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <span>⚙️</span> Configuración
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="bg-zinc-900 rounded-xl p-4 space-y-1">
            <div className="text-2xl font-bold">IA</div>
            <div className="text-zinc-400 text-sm">Claude Haiku responde al instante</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 space-y-1">
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-zinc-400 text-sm">Disponible siempre vía WhatsApp</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 space-y-1">
            <div className="text-2xl font-bold">DB</div>
            <div className="text-zinc-400 text-sm">Reservas guardadas en Neon</div>
          </div>
        </div>

        <p className="text-zinc-600 text-sm">
          Stack: Next.js · TypeScript · Claude API · Twilio · Neon · Vercel
        </p>
      </div>
    </main>
  );
}
