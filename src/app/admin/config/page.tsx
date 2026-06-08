"use client";

import { useEffect, useState } from "react";
import type { RestaurantConfigData, MenuItem, FAQ, RestaurantHours } from "@/types";

const DAYS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

const emptyConfig: RestaurantConfigData = {
  name: "",
  address: "",
  phone: "",
  hours: {},
  menu: [],
  faqs: [],
};

export default function ConfigPage() {
  const [config, setConfig] = useState<RestaurantConfigData>(emptyConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (data) setConfig(data);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateHours(day: string, field: "open" | "close", value: string) {
    setConfig((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: { ...(prev.hours[day] as { open: string; close: string } ?? { open: "12:00", close: "22:00" }), [field]: value },
      },
    }));
  }

  function toggleDay(day: string, open: boolean) {
    setConfig((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: open ? { open: "12:00", close: "22:00" } : null,
      },
    }));
  }

  function addMenuItem() {
    setConfig((prev) => ({
      ...prev,
      menu: [...prev.menu, { name: "", description: "", price: 0, category: "" }],
    }));
  }

  function updateMenuItem(index: number, field: keyof MenuItem, value: string | number) {
    setConfig((prev) => ({
      ...prev,
      menu: prev.menu.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  }

  function removeMenuItem(index: number) {
    setConfig((prev) => ({ ...prev, menu: prev.menu.filter((_, i) => i !== index) }));
  }

  function addFAQ() {
    setConfig((prev) => ({ ...prev, faqs: [...prev.faqs, { question: "", answer: "" }] }));
  }

  function updateFAQ(index: number, field: keyof FAQ, value: string) {
    setConfig((prev) => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)),
    }));
  }

  function removeFAQ(index: number) {
    setConfig((prev) => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }));
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Configuración del restaurante</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar cambios"}
        </button>
      </div>

      {/* Info básica */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Información general</h2>
        {(["name", "address", "phone"] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm text-gray-600 mb-1 capitalize">{field === "name" ? "Nombre" : field === "address" ? "Dirección" : "Teléfono"}</label>
            <input
              type="text"
              value={config[field]}
              onChange={(e) => setConfig((prev) => ({ ...prev, [field]: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </section>

      {/* Horarios */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">Horarios</h2>
        {DAYS.map((day) => {
          const hours = config.hours[day] as { open: string; close: string } | null | undefined;
          const isOpen = hours !== null && hours !== undefined;
          return (
            <div key={day} className="flex items-center gap-4">
              <div className="w-28 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={(e) => toggleDay(day, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 capitalize">{day}</span>
              </div>
              {isOpen ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={hours?.open ?? "12:00"}
                    onChange={(e) => updateHours(day, "open", e.target.value)}
                    className="border border-gray-200 rounded px-2 py-1 text-sm"
                  />
                  <span className="text-gray-400 text-sm">a</span>
                  <input
                    type="time"
                    value={hours?.close ?? "22:00"}
                    onChange={(e) => updateHours(day, "close", e.target.value)}
                    className="border border-gray-200 rounded px-2 py-1 text-sm"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-400">Cerrado</span>
              )}
            </div>
          );
        })}
      </section>

      {/* Menú */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Menú</h2>
          <button onClick={addMenuItem} className="text-sm text-blue-600 hover:text-blue-700">+ Agregar plato</button>
        </div>
        {config.menu.map((item, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 items-start">
            <input
              placeholder="Nombre"
              value={item.name}
              onChange={(e) => updateMenuItem(i, "name", e.target.value)}
              className="border border-gray-200 rounded px-2 py-1 text-sm"
            />
            <input
              placeholder="Descripción"
              value={item.description}
              onChange={(e) => updateMenuItem(i, "description", e.target.value)}
              className="border border-gray-200 rounded px-2 py-1 text-sm"
            />
            <input
              placeholder="Categoría"
              value={item.category}
              onChange={(e) => updateMenuItem(i, "category", e.target.value)}
              className="border border-gray-200 rounded px-2 py-1 text-sm"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Precio"
                value={item.price}
                onChange={(e) => updateMenuItem(i, "price", Number(e.target.value))}
                className="border border-gray-200 rounded px-2 py-1 text-sm w-full"
              />
              <button onClick={() => removeMenuItem(i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
            </div>
          </div>
        ))}
      </section>

      {/* FAQs */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Preguntas frecuentes</h2>
          <button onClick={addFAQ} className="text-sm text-blue-600 hover:text-blue-700">+ Agregar pregunta</button>
        </div>
        {config.faqs.map((faq, i) => (
          <div key={i} className="space-y-2">
            <div className="flex gap-2">
              <input
                placeholder="Pregunta"
                value={faq.question}
                onChange={(e) => updateFAQ(i, "question", e.target.value)}
                className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm"
              />
              <button onClick={() => removeFAQ(i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
            </div>
            <textarea
              placeholder="Respuesta"
              value={faq.answer}
              onChange={(e) => updateFAQ(i, "answer", e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded px-2 py-1 text-sm"
            />
          </div>
        ))}
      </section>
    </div>
  );
}
