import React, { useEffect, useMemo, useRef, useState } from "react";
import AddRoutineModal, { type NewRoutine } from "../components/AddRoutineModal";
import RoutineDetailModal from "../components/RoutineDetailModal";
import CompletionChoicesModal from "../components/CompletionChoicesModal";
import { FiCheckCircle } from "react-icons/fi";
// @ts-ignore - local JS client without types shipped here
import { supabase } from '../supabaseClient'

const Home: React.FC = () => {
  const LS_KEY = "ritmo.routines";
  const todayKey = new Date().toISOString().slice(0, 10);
  const LS_DONE_KEY = `ritmo.routines.done.${todayKey}`;
  const LS_TRIG_KEY = `ritmo.routines.trig.${todayKey}`;

  const [open, setOpen] = useState(false);
  const [routines, setRoutines] = useState<Array<NewRoutine & { id: string }>>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(LS_DONE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [nowMins, setNowMins] = useState<number>(() => new Date().getHours() * 60 + new Date().getMinutes());
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [triggeredIds, setTriggeredIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(LS_TRIG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [showChoices, setShowChoices] = useState(false);
  const [justCompletedName, setJustCompletedName] = useState<string | null>(null);

  // On mount: if user is signed in, load routines from DB for that user;
  // otherwise fall back to localStorage. DB results are preferred when available.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user ?? null;
        if (user) {
          const res = await supabase.from("routines").select("*").eq("routine_id", user.id);
          const data = res?.data;
          if (!cancelled && data && Array.isArray(data)) {
            const mapped = data.map((row: any) => {
              // description is expected to contain JSON blob of the routine details
              let desc: any = {};
              try {
                desc = typeof row.description === 'string' ? JSON.parse(row.description) : row.description ?? {};
              } catch (e) {
                desc = row.description ?? {};
              }
              // Keep a stable id used by the app (prefix with db- to avoid collisions with local tmp ids)
              return { ...(desc as NewRoutine), id: `db-${row.id}` };
            });
            setRoutines(mapped as any);
            return;
          }
        }

        // no signed-in user or DB fetch failed: fallback to localStorage
        try {
          const raw = localStorage.getItem(LS_KEY);
          if (raw && !cancelled) setRoutines(JSON.parse(raw));
        } catch {}
      } catch (err) {
        // If anything goes wrong, fall back to localStorage (silent)
        try {
          const raw = localStorage.getItem(LS_KEY);
          if (raw && !cancelled) setRoutines(JSON.parse(raw));
        } catch {}
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(routines));
    } catch {}
  }, [routines]);

  // Save completedIds to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LS_DONE_KEY, JSON.stringify(completedIds));
    } catch {}
  }, [completedIds]);

  // Save triggeredIds to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LS_TRIG_KEY, JSON.stringify(triggeredIds));
    } catch {}
  }, [triggeredIds]);

  // Keep current time updated to drive active/next highlighting and auto alarms
  useEffect(() => {
    const compute = () => {
      const d = new Date();
      setNowMins(d.getHours() * 60 + d.getMinutes());
      setNowMs(d.getTime());
    };
    compute();
    const t = setInterval(compute, 5_000);
    return () => clearInterval(t);
  }, []);

  const addRoutine = async (data: NewRoutine) => {
    // create a temporary id so UI is responsive while we persist to DB
    const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newRoutine = { ...data, id: tempId };
    setRoutines((prev) => [...prev, newRoutine]);

    // attempt to persist to Supabase if user is signed in
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user ?? null;
      if (!user) return; // not signed in; keep local-only

      const timeStr = `${data.hour}:${String(data.minute).padStart(2, '0')} ${data.period}`;
      const description = JSON.stringify(data);

      const { data: inserted, error } = await supabase
        .from("routines")
        .insert([
          {
            routine_id: user.id,
            name: data.name,
            description,
            is_active: true,
            time: timeStr,
          },
        ])
        .select();

      if (error) {
        console.error("Failed to save routine to DB:", error);
        return;
      }

      if (inserted && inserted[0]) {
        const row = inserted[0] as any;
        const dbId = `db-${row.id}`;
        // replace temporary id with db id so future loads map cleanly
        setRoutines((prev) => prev.map((r) => (r.id === tempId ? { ...r, id: dbId } : r)));
      }
    } catch (err) {
      console.error("Error saving routine:", err);
    }
  };

  const selected = selectedId ? routines.find((r) => r.id === selectedId) ?? null : null;

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    setSelectedId(null);
  };

  const isDone = (id: string) => completedIds.includes(id);

  const doneCount = useMemo(() => routines.reduce((acc, r) => acc + (completedIds.includes(r.id) ? 1 : 0), 0), [routines, completedIds]);
  const totalCount = routines.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const knobPct = Math.max(0, Math.min(100, progressPct));

  const formatTime = (h: number, m: number, p: 'AM' | 'PM') => {
    const mm = m.toString().padStart(2, '0');
    return `${h}:${mm} ${p}`;
  };

  // Helpers for time-of-day math
  const toMinutes = (h: number, m: number, p: 'AM' | 'PM') => {
    let hh = h % 12;
    if (p === 'PM') hh += 12;
    return hh * 60 + m;
  };

  const toTodayMillis = (h: number, m: number, p: 'AM' | 'PM') => {
    const d = new Date();
    let hh = h % 12;
    if (p === 'PM') hh += 12;
    d.setHours(hh, m, 0, 0);
    return d.getTime();
  };

  // Sort routines by their time of day
  const sorted = useMemo(() => {
    return [...routines].sort((a, b) => toMinutes(a.hour, a.minute, a.period) - toMinutes(b.hour, b.minute, b.period));
  }, [routines]);

  // Determine current (active) and the next upcoming routine. Skip ones already marked done.
  const { activeId, nextId, startInMins } = useMemo(() => {
    if (sorted.length === 0) return { activeId: null as string | null, nextId: null as string | null, startInMins: null as number | null };
    const notDone = sorted.filter((r) => !completedIds.includes(r.id));
    const now = nowMins;

    // latest not-done whose time <= now
    let active: (typeof sorted)[number] | null = null;
    for (const r of notDone) {
      const t = toMinutes(r.hour, r.minute, r.period);
      if (t <= now && (!active || t > toMinutes(active.hour, active.minute, active.period))) {
        active = r;
      }
    }
    if (!active) active = notDone[0] ?? null; // if none in past, next up becomes active

    const upcoming = sorted.filter((r) => toMinutes(r.hour, r.minute, r.period) > now);
    const next = upcoming[0] ?? null;
    const minutesToNext = next ? Math.max(0, toMinutes(next.hour, next.minute, next.period) - now) : null;

    return { activeId: active?.id ?? null, nextId: next?.id ?? null, startInMins: minutesToNext };
  }, [sorted, nowMins, completedIds]);

  // Auto ring alarms when time hits (within a 5-minute window) for un-done and not-yet-triggered routines
  useEffect(() => {
    const now = nowMs;
    for (const r of sorted) {
      if (completedIds.includes(r.id)) continue;
      if (triggeredIds.includes(r.id)) continue; // Already triggered for today
      if (!r.ringtone?.url) continue;
      const ts = toTodayMillis(r.hour, r.minute, r.period);
      const GRACE = 5 * 60_000; // 5 minutes
      if (now >= ts && now < ts + GRACE) {
        // Mark as triggered BEFORE playing to prevent re-triggers on rapid re-renders or refreshes
        setTriggeredIds((prev) => {
          // Double-check it's not already in the list (race condition protection)
          if (prev.includes(r.id)) return prev;
          return [...prev, r.id];
        });
        
        if (!audioRef.current) audioRef.current = new Audio();
        const a = audioRef.current;
        a.src = r.ringtone.url;
        a.loop = false;
        a.volume = 1.0;
        a.play().catch(() => {
          // Autoplay may be blocked by the browser; per request, do not show alerts.
          // You can consider showing a non-intrusive in-app banner instead.
          // console.debug("Autoplay blocked for routine:", r.name);
        });
      }
    }
  }, [nowMs, sorted, completedIds, triggeredIds]);

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

      <div className="py-4 sm:py-6 flex items-center justify-center">
        <button
          onClick={() => setOpen(true)}
          className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-[#2D7778] text-white shadow-[0_10px_0_rgba(45,119,120,0.35)] flex items-center justify-center text-3xl sm:text-4xl"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {sorted.map((r) => {
              const ms = toTodayMillis(r.hour, r.minute, r.period);
              const diffMs = ms - nowMs;
              const upcoming = diffMs > 0;
              const mins = Math.ceil(diffMs / 60_000);
              const hours = Math.floor(mins / 60);
              const minsR = mins % 60;
              const label = upcoming
                ? hours > 0
                  ? `in ${hours}h${minsR > 0 ? ` ${minsR}m` : ''}`
                  : `in ${Math.max(mins, 1)}m`
                : 'now';
              return (
              <button
                key={r.id}
                onClick={() => {
                  // Only show completion choices when routine is at time or already past
                  if (!upcoming) {
                    setJustCompletedName(r.name)
                    // Mark as completed
                    if (!completedIds.includes(r.id)) {
                      setCompletedIds((prev) => [...prev, r.id])
                    }
                    setShowChoices(true)
                  }
                }}
                className={`relative rounded-2xl ${upcoming && r.id !== activeId ? 'bg-white/70' : 'bg-white/90'} text-left text-slate-900 p-2.5 sm:p-3 md:p-4 shadow transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7778] ${
                  r.id === activeId ? 'scale-[1.03] border-2 border-[#2D7778] shadow-xl' : 'hover:shadow-lg border border-transparent'
                } ${isDone(r.id) ? 'opacity-90' : upcoming && r.id !== activeId ? '' : ''}`}
              >
                <div className={`w-full aspect-square rounded-xl ${upcoming && r.id !== activeId ? 'bg-slate-300/50' : 'bg-white'} flex items-center justify-center overflow-hidden`}>
                  {r.preset?.url ? (
                    <img src={r.preset.url} alt={r.preset.label} className={`h-full w-full object-contain ${upcoming && r.id !== activeId ? 'grayscale' : ''}`} />
                  ) : (
                    <div className="text-3xl" role="img" aria-label="routine">🗓️</div>
                  )}
                </div>
                <div className="mt-2">
                  <div className="font-semibold truncate text-sm sm:text-base">{r.name}</div>
                  <div className="text-xs sm:text-sm text-slate-600">{formatTime(r.hour, r.minute, r.period)}</div>
                  {r.ringtoneName && (
                    <div className="text-[11px] sm:text-xs text-slate-500 truncate">🔔 {r.ringtoneName}</div>
                  )}
                </div>
                {!isDone(r.id) && upcoming && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
                    <div className="rounded-full bg-[#2D7778]/90 text-white px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold shadow">
                      {label}
                    </div>
                  </div>
                )}
                {r.id === nextId && startInMins !== null && startInMins >= 0 && (
                  <div className="absolute inset-0 rounded-2xl flex items-center justify-center pointer-events-none z-10">
                    <div className="rounded-full bg-[#2D7778]/90 text-white px-3 sm:px-4 py-1 text-xs sm:text-sm font-semibold shadow-md">
                      {startInMins === 0 ? 'Starting now' : `Start in: ${startInMins} ${startInMins === 1 ? 'minute' : 'minutes'}`}
                    </div>
                  </div>
                )}
                {isDone(r.id) && (
                  <div className="absolute top-2 right-2 text-emerald-600">
                    <FiCheckCircle size={20} />
                  </div>
                )}
              </button>
            );})}
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
      />

      <CompletionChoicesModal
        open={showChoices}
        onClose={() => setShowChoices(false)}
        routineName={justCompletedName ?? undefined}
        onChooseBookGuide={() => setShowChoices(false)}
        onChooseMiniGame={() => setShowChoices(false)}
      />
    </div>
  );
};

export default Home;
