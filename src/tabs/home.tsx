import React, { useEffect, useMemo, useState } from "react";
import AddRoutineModal, { type NewRoutine } from "../components/AddRoutineModal";
import RoutineDetailModal from "../components/RoutineDetailModal";
import { FiCheckCircle } from "react-icons/fi";

const Home: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [routines, setRoutines] = useState<Array<NewRoutine & { id: string }>>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const LS_KEY = "ritmo.routines";
  const todayKey = new Date().toISOString().slice(0, 10);
  const LS_DONE_KEY = `ritmo.routines.done.${todayKey}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setRoutines(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(routines));
    } catch {}
  }, [routines]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_DONE_KEY);
      if (raw) setCompletedIds(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_DONE_KEY, JSON.stringify(completedIds));
    } catch {}
  }, [completedIds]);

  const addRoutine = (data: NewRoutine) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setRoutines((prev) => [...prev, { ...data, id }]);
  };

  const selected = selectedId ? routines.find((r) => r.id === selectedId) ?? null : null;

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    setSelectedId(null);
  };

  const isDone = (id: string) => completedIds.includes(id);
  const toggleDone = (id: string) => {
    setCompletedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const doneCount = useMemo(() => routines.reduce((acc, r) => acc + (completedIds.includes(r.id) ? 1 : 0), 0), [routines, completedIds]);
  const totalCount = routines.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const knobPct = Math.max(0, Math.min(100, progressPct));

  const formatTime = (h: number, m: number, p: 'AM' | 'PM') => {
    const mm = m.toString().padStart(2, '0');
    return `${h}:${mm} ${p}`;
  };

  return (
    <div className="text-white">
      {totalCount > 0 && (
        <div className="px-4 pt-6">
          {/* Progress Card */}
          <div className="rounded-2xl border bg-white/95 text-slate-900 shadow p-4" style={{ borderColor: '#2D7778' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold">Daily Progress</div>
              <div className="text-[#2D7778] font-semibold">{doneCount} of {totalCount}</div>
            </div>
            <div className="relative h-3 rounded-full bg-gray-300">
              <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${progressPct}%`, backgroundColor: '#2D7778' }} />
              <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `calc(${knobPct}% - 8px)` }}>
                <div className="h-4 w-4 rounded-full bg-black" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="py-6 flex items-center justify-center">
        <button
          onClick={() => setOpen(true)}
          className="h-20 w-20 rounded-full bg-[#2D7778] text-white shadow-[0_10px_0_rgba(45,119,120,0.35)] flex items-center justify-center text-4xl"
          aria-label="Add Routine"
        >
          +
        </button>
      </div>

      {/* Routines grid */}
      <div className="px-4 pb-10">
        {routines.length === 0 ? (
          <p className="text-center text-slate-700 text-2xl">No routines yet. Tap + to add one.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {routines.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`relative rounded-2xl bg-white/90 text-left text-slate-900 p-3 shadow hover:shadow-lg transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7778] ${isDone(r.id) ? 'opacity-90' : ''}`}
              >
                <div className="w-full aspect-square rounded-xl bg-white flex items-center justify-center overflow-hidden">
                  {r.preset?.url ? (
                    <img src={r.preset.url} alt={r.preset.label} className="h-full w-full object-contain" />
                  ) : (
                    <div className="text-3xl" role="img" aria-label="routine">🗓️</div>
                  )}
                </div>
                <div className="mt-2">
                  <div className="font-semibold truncate">{r.name}</div>
                  <div className="text-sm text-slate-600">{formatTime(r.hour, r.minute, r.period)}</div>
                  {r.ringtoneName && (
                    <div className="text-xs text-slate-500 truncate">🔔 {r.ringtoneName}</div>
                  )}
                </div>
                {isDone(r.id) && (
                  <div className="absolute top-2 right-2 text-emerald-600">
                    <FiCheckCircle size={20} />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <AddRoutineModal
        open={open}
        onClose={() => setOpen(false)}
        onDone={(payload) => {
          addRoutine(payload);
        }}
      />

      <RoutineDetailModal
        open={!!selected}
        onClose={() => setSelectedId(null)}
        routine={selected as any}
        onDelete={deleteRoutine}
        completed={selected ? isDone(selected.id) : false}
        onToggleDone={(id) => toggleDone(id)}
      />
    </div>
  );
};

export default Home;
