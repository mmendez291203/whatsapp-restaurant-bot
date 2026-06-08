import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold text-gray-900">La Trattoria — Admin</span>
          <div className="flex gap-6">
            <Link
              href="/admin/conversations"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Conversaciones
            </Link>
            <Link
              href="/admin/config"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Configuración
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}