"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Circle,
  CheckCircle2,
  RotateCcw,
  RotateCw,
  X,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getDaysInMonth, getFirstDayOfMonth } from "./utils";

type CapacityMode = "today" | "month" | "year";
type LoadLevel = "light" | "medium" | "heavy";

type CalendarEvent = {
  id: number;
  title: string;
  desc: string;
  date: string; // YYYY-MM-DD
  time: string; // "All Day" or HH:MM
  load: LoadLevel;
  isAllDay: boolean;
  completed: boolean;
};

export default function CalendarPage() {
  // --- STATE ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [capacityMode, setCapacityMode] = useState<CapacityMode>("today");

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [past, setPast] = useState<CalendarEvent[][]>([]);
  const [future, setFuture] = useState<CalendarEvent[][]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showCapInfo, setShowCapInfo] = useState(false);

  // Day overlay
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const [isAllDay, setIsAllDay] = useState(false);
  const [isPriorityExpanded, setIsPriorityExpanded] = useState(false);

  // Top priorities animation support
  const [priorityAnimatingIds, setPriorityAnimatingIds] = useState<number[]>(
    [],
  );

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(month, year);
  const startDay = getFirstDayOfMonth(month, year);

  const todayStr = new Date().toISOString().split("T")[0];

  // --- UNDO / REDO ---
  const saveHistory = () => {
    setPast((prev) => [...prev, events]);
    setFuture([]);
  };

  const undo = () => {
    if (past.length === 0) return;
    setFuture((prev) => [events, ...prev]);
    setEvents(past[past.length - 1]);
    setPast((prev) => prev.slice(0, -1));
  };

  const redo = () => {
    if (future.length === 0) return;
    setPast((prev) => [...prev, events]);
    setEvents(future[0]);
    setFuture((prev) => prev.slice(1));
  };

  // --- HELPERS ---
  const getSoftColor = (load: LoadLevel) => {
    if (load === "heavy") return "bg-[#FCA5A5]";
    if (load === "medium") return "bg-[#FDE68A]";
    return "bg-[#A7F3D0]";
  };

  const formatPrettyDate = (yyyyMmDd: string) => {
    const [y, m, d] = yyyyMmDd.split("-").map((x) => parseInt(x, 10));
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return dt.toLocaleDateString(undefined, {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getHashedOverlay = (completed: boolean) => {
    if (!completed) return null;
    return (
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.10]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #1f0f24 0px, #1f0f24 6px, transparent 6px, transparent 14px)",
        }}
      />
    );
  };

  // Derived day events (live)
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return events.filter((e) => e.date === selectedDay);
  }, [events, selectedDay]);

  const isDayEmpty = selectedDay ? selectedDayEvents.length === 0 : true;

  // --- ACTIONS ---
  const toggleComplete = (id: number) => {
    saveHistory();
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === id ? { ...ev, completed: !ev.completed } : ev,
      ),
    );
  };

  const toggleCompleteFromPriority = (id: number) => {
    setPriorityAnimatingIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
    toggleComplete(id);
    window.setTimeout(() => {
      setPriorityAnimatingIds((prev) => prev.filter((x) => x !== id));
    }, 260);
  };

  const handleAddEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveHistory();

    const formData = new FormData(e.currentTarget);

    const newEv: CalendarEvent = {
      id: Date.now(),
      title: (formData.get("title") as string) || "",
      desc: (formData.get("desc") as string) || "",
      date: (formData.get("date") as string) || "",
      time: isAllDay ? "All Day" : (formData.get("time") as string) || "",
      load: ((formData.get("load") as string) || "medium") as LoadLevel,
      isAllDay,
      completed: false,
    };

    setEvents((prev) => [...prev, newEv]);
    setIsAddModalOpen(false);
    setIsAllDay(false);
  };

  // --- DYNAMIC CAPACITY ---
  const capacity = useMemo(() => {
    const weights: Record<LoadLevel, number> = {
      light: 1,
      medium: 3,
      heavy: 5,
    };
    const thresholds: Record<CapacityMode, number> = {
      today: 10,
      month: 60,
      year: 300,
    };

    const active = events.filter((e) => !e.completed);
    let filtered = active;

    if (capacityMode === "today") {
      filtered = active.filter((e) => e.date === todayStr);
    } else if (capacityMode === "month") {
      filtered = active.filter((e) => {
        const d = new Date(e.date);
        return d.getUTCMonth() === month && d.getUTCFullYear() === year;
      });
    }

    const totalWeight = filtered.reduce(
      (acc, curr) => acc + (weights[curr.load] || 3),
      0,
    );
    return Math.min(
      Math.floor((totalWeight / thresholds[capacityMode]) * 100),
      100,
    );
  }, [events, capacityMode, month, year, todayStr]);

  // Top priorities list
  const topPriorityItems = useMemo(() => {
    const active = events.filter((e) => !e.completed);
    const animating = events.filter((e) => priorityAnimatingIds.includes(e.id));
    const merged = [
      ...active,
      ...animating.filter((a) => !active.some((x) => x.id === a.id)),
    ];
    return merged.slice(0, isPriorityExpanded ? 10 : 3);
  }, [events, priorityAnimatingIds, isPriorityExpanded]);

  // Anim variants for day cards
  const dayListVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  };

  const dayCardVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.99 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22 } },
  };

  return (
    <div className="min-h-screen bg-ma-cream p-8 md:p-16 relative font-sans text-ma-eggplant">
      <header className="max-w-[1400px] mx-auto mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-6xl font-serif mb-2 tracking-tight text-ma-eggplant">
            My Scheduler
          </h1>
          <p className="opacity-60 text-xl font-light italic">
            A sanctuary for your time.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={undo}
            disabled={past.length === 0}
            className="p-4 rounded-full bg-white/40 hover:bg-white border border-white/40 shadow-sm transition-all disabled:opacity-40"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="p-4 rounded-full bg-white/40 hover:bg-white border border-white/40 shadow-sm transition-all disabled:opacity-40"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-3 bg-ma-terracotta text-white px-10 py-4 rounded-full shadow-lg hover:scale-105 transition-all font-bold ml-4"
          >
            <Plus className="w-6 h-6 stroke-[3px]" /> Add Event
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-10 items-start">
        {/* CALENDAR */}
        <div className="col-span-12 lg:col-span-8 bg-ma-sand/30 rounded-[2.5rem] p-10 border border-white shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-serif tracking-tight">
              {currentDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="p-3 rounded-full border border-ma-plum/10 hover:bg-white transition-colors"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="p-3 rounded-full border border-ma-plum/10 hover:bg-white transition-colors"
              >
                <ChevronRight />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-6">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-bold opacity-30 uppercase tracking-[.2em]"
              >
                {d}
              </div>
            ))}

            {[...Array(startDay)].map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {[...Array(daysInMonth)].map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const dateString = dateObj.toISOString().split("T")[0];
              const dayEvents = events.filter((e) => e.date === dateString);
              const isToday = dateString === todayStr;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDay(dateString)}
                  className={`aspect-square rounded-[1.8rem] p-3 border transition-all flex flex-col justify-between group cursor-pointer
                  ${
                    isToday
                      ? "border-ma-terracotta ring-1 ring-ma-terracotta/20 bg-white shadow-md"
                      : "border-white bg-white/20 hover:bg-white"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      isToday ? "text-ma-terracotta" : "opacity-40"
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Dots stay visible even when completed */}
                  <div className="flex flex-wrap gap-1 justify-end">
                    {dayEvents.map((e) => (
                      <div
                        key={e.id}
                        title={e.title}
                        className={`w-2.5 h-2.5 rounded-full ${getSoftColor(e.load)} ${
                          e.completed
                            ? "ring-1 ring-ma-eggplant/40 opacity-70"
                            : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Top Priorities */}
          <div className="bg-white/60 rounded-[2rem] p-8 border border-white shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif font-bold">Top Priorities</h3>
              <button
                onClick={() => setIsPriorityExpanded(!isPriorityExpanded)}
                className="opacity-30 hover:opacity-100 transition-opacity"
              >
                {isPriorityExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>

            <div
              className={`space-y-4 overflow-hidden transition-all duration-500 ${
                isPriorityExpanded ? "max-h-[1000px]" : "max-h-[300px]"
              }`}
            >
              <AnimatePresence initial={false}>
                {topPriorityItems.map((event) => {
                  const isCompleting = priorityAnimatingIds.includes(event.id);
                  const showCompletedStyle = event.completed || isCompleting;

                  return (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        y: -8,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <button
                        onClick={() => toggleCompleteFromPriority(event.id)}
                        className="w-full bg-ma-sand/20 p-5 rounded-[1.5rem] flex justify-between items-center border border-white/50 hover:bg-white transition-all group overflow-hidden"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div
                            className={`w-3 h-3 rounded-full ${getSoftColor(event.load)}`}
                          />
                          <div className="flex flex-col">
                            <span
                              className={`font-medium transition-all ${
                                showCompletedStyle
                                  ? "line-through opacity-50"
                                  : ""
                              }`}
                            >
                              {event.title}
                            </span>
                            <span className="text-[10px] opacity-40 uppercase tracking-widest">
                              {event.date}
                            </span>
                          </div>
                        </div>

                        <motion.div
                          initial={false}
                          animate={{ scale: [1, 1.12, 1] }}
                          transition={{ duration: 0.22 }}
                        >
                          {showCompletedStyle ? (
                            <CheckCircle2 className="w-5 h-5 text-ma-rose" />
                          ) : (
                            <Circle className="text-ma-plum/10 group-hover:text-ma-rose w-5 h-5" />
                          )}
                        </motion.div>
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {topPriorityItems.length === 0 && (
                <div className="text-sm opacity-50 italic">
                  No active priorities. Add an event!
                </div>
              )}
            </div>
          </div>

          {/* Capacity Density */}
          <div className="bg-ma-eggplant text-ma-cream rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-[11px] uppercase tracking-[0.4em] opacity-40 font-bold">
                  Capacity Density
                </h4>
                <button
                  onClick={() => setShowCapInfo(true)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <HelpCircle className="w-5 h-5 opacity-40" />
                </button>
              </div>

              <div className="flex items-end gap-3 mb-8">
                <span className="text-7xl font-serif tracking-tighter">
                  {capacity}%
                </span>
                <div className="flex bg-white/5 rounded-full p-1 mb-2">
                  {(["today", "month", "year"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setCapacityMode(m)}
                      className={`text-[8px] px-3 py-1 rounded-full uppercase font-bold tracking-widest transition-all ${
                        capacityMode === m
                          ? "bg-ma-terracotta text-white"
                          : "opacity-30 hover:opacity-100"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${capacity}%` }}
                  className="bg-gradient-to-r from-ma-terracotta to-ma-rose h-full transition-all duration-1000 ease-out"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DAY VIEW OVERLAY (with bottom gutter spacer so scrollbar ends early) */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            className="fixed inset-0 bg-ma-eggplant/40 backdrop-blur-md z-[100] flex items-center justify-center p-6"
            onClick={() => setSelectedDay(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 18, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 18, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className={`bg-ma-cream rounded-[3.5rem] w-full max-w-md shadow-2xl border border-ma-sand/20 overflow-hidden flex flex-col min-h-0 ${
                isDayEmpty ? "h-auto" : "h-[78vh]"
              }`}
            >
              <style jsx>{`
                .dayScroll {
                  scrollbar-gutter: stable;
                  scrollbar-width: thin;
                  scrollbar-color: rgba(31, 15, 36, 0.35) rgba(0, 0, 0, 0.06);
                  -webkit-overflow-scrolling: touch;
                  overscroll-behavior: contain;
                  touch-action: pan-y;
                }
                .dayScroll::-webkit-scrollbar {
                  width: 12px;
                }
                .dayScroll::-webkit-scrollbar-track {
                  background: rgba(0, 0, 0, 0.06);
                  border-radius: 999px;
                  margin: 16px 0;
                }
                .dayScroll::-webkit-scrollbar-thumb {
                  background: rgba(31, 15, 36, 0.32);
                  border-radius: 999px;
                  border: 3px solid rgba(0, 0, 0, 0.06);
                }
                .dayScroll::-webkit-scrollbar-thumb:hover {
                  background: rgba(31, 15, 36, 0.44);
                }
              `}</style>

              {/* Header */}
              <div className="shrink-0 px-10 pt-10 pb-6 bg-ma-cream border-b border-ma-sand/30">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">
                      Day View
                    </span>
                    <span className="text-base font-semibold opacity-80 mt-1">
                      {formatPrettyDate(selectedDay)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="rounded-full p-3 hover:bg-ma-sand/30 transition-all"
                    onClick={() => setSelectedDay(null)}
                    aria-label="Close"
                  >
                    <X className="w-7 h-7 opacity-30 hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>

              {/* Body */}
              {isDayEmpty ? (
                <div className="px-10 pt-8 pb-10">
                  <div className="bg-white rounded-[2.5rem] p-10 border border-ma-sand/20 text-center opacity-60 italic">
                    No tasks on this day.
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-h-0 overflow-hidden">
                  <div className="dayScroll h-full min-h-0 overflow-y-auto overflow-x-hidden px-10 pr-8 pb-10 pt-8 snap-y snap-mandatory">
                    <motion.div
                      initial="hidden"
                      animate="show"
                      variants={dayListVariants}
                      className="flex flex-col gap-6"
                    >
                      {selectedDayEvents.map((event) => (
                        <motion.div
                          key={event.id}
                          variants={dayCardVariants}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.99 }}
                          className="relative snap-center shrink-0 w-full min-h-[360px] bg-white rounded-[2.5rem] p-10 border border-ma-sand/20 flex flex-col justify-center text-center shadow-sm overflow-hidden"
                        >
                          {getHashedOverlay(event.completed)}

                          <div
                            className={`relative z-10 w-12 h-1.5 rounded-full mx-auto mb-8 ${getSoftColor(
                              event.load,
                            )}`}
                          />

                          <motion.h3
                            layout
                            animate={{ opacity: event.completed ? 0.4 : 1 }}
                            className={`relative z-10 text-4xl font-serif mb-3 tracking-tight ${
                              event.completed ? "line-through" : ""
                            }`}
                          >
                            {event.title}
                          </motion.h3>

                          <p className="relative z-10 text-ma-plum/60 text-sm mb-6">
                            {event.time} • {event.load.toUpperCase()} LOAD
                          </p>

                          {event.desc && (
                            <p className="relative z-10 text-ma-plum/80 text-sm mb-10 italic">
                              {event.desc}
                            </p>
                          )}

                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleComplete(event.id)}
                            className="relative z-10 w-fit border border-ma-eggplant/10 px-8 py-3 rounded-full mx-auto text-[10px] font-bold uppercase tracking-widest hover:bg-ma-eggplant hover:text-white transition-all"
                          >
                            {event.completed ? "Restore Task" : "Mark Done"}
                          </motion.button>
                        </motion.div>
                      ))}

                      <div className="h-14" />
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD EVENT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            className="fixed inset-0 bg-ma-eggplant/30 backdrop-blur-lg z-[80] flex items-center justify-center p-6"
            onClick={() => setIsAddModalOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              onSubmit={handleAddEvent}
              className="bg-white rounded-[3rem] p-12 max-w-lg w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 18, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 18, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
            >
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-8 right-8 rounded-full p-3 hover:bg-ma-sand/30 transition-all"
                aria-label="Close"
              >
                <X className="w-10 h-10 opacity-30 hover:opacity-100 transition-opacity" />
              </button>

              <h2 className="text-4xl font-serif mb-10 tracking-tight text-ma-eggplant">
                New Planning
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold opacity-30 uppercase tracking-widest ml-1">
                    Event Title
                  </label>
                  <input
                    name="title"
                    required
                    placeholder="What's the plan?"
                    className="w-full p-5 bg-ma-sand/10 rounded-[1.2rem] outline-none focus:border-ma-rose transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold opacity-30 uppercase tracking-widest ml-1">
                    Description (Optional)
                  </label>
                  <textarea
                    name="desc"
                    placeholder="Details/notes"
                    rows={2}
                    className="w-full p-5 bg-ma-sand/10 rounded-[1.2rem] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold opacity-30 uppercase tracking-widest ml-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      required
                      className="w-full p-5 bg-ma-sand/10 rounded-[1.2rem] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold opacity-30 uppercase tracking-widest ml-1">
                      Time Settings
                    </label>

                    <div className="p-5 bg-ma-sand/5 rounded-[1.2rem] border border-ma-sand/10 h-full flex flex-col justify-center">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold opacity-40">
                          ALL DAY?
                        </span>
                        <input
                          type="checkbox"
                          checked={isAllDay}
                          onChange={() => setIsAllDay(!isAllDay)}
                          className="accent-ma-terracotta cursor-pointer"
                        />
                      </div>

                      {!isAllDay && (
                        <input
                          type="time"
                          name="time"
                          required
                          className="mt-3 bg-transparent text-sm border-b border-ma-plum/10 outline-none"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  {(["heavy", "medium", "light"] as const).map((l) => (
                    <label key={l} className="cursor-pointer">
                      <input
                        type="radio"
                        name="load"
                        value={l}
                        defaultChecked={l === "medium"}
                        className="peer sr-only"
                      />
                      <div
                        className={`p-4 text-center rounded-[1.2rem] opacity-40 peer-checked:opacity-100 peer-checked:ring-2 ring-ma-eggplant ring-offset-4 transition-all ${getSoftColor(
                          l,
                        )} text-ma-eggplant text-[9px] font-bold uppercase tracking-widest`}
                      >
                        {l}
                      </div>
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full bg-ma-terracotta text-white py-6 rounded-full font-bold shadow-lg text-xl mt-6 uppercase tracking-widest hover:brightness-105 transition-all"
                >
                  Create Event
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INFO MODAL */}
      <AnimatePresence>
        {showCapInfo && (
          <motion.div
            className="fixed inset-0 bg-ma-eggplant/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
            onClick={() => setShowCapInfo(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-12 rounded-[3rem] max-w-sm text-center shadow-2xl relative border border-ma-sand/20"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 18, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 18, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
            >
              <h3 className="text-3xl font-serif mb-6 text-ma-eggplant tracking-tight text-shadow-sm">
                How we measure.
              </h3>

              <p className="text-sm opacity-60 leading-relaxed mb-10 font-medium">
                We assume a daily energy budget of{" "}
                <span className="font-bold text-ma-terracotta">10 points</span>.
                <br />
                <br />•{" "}
                <span className="bg-[#FCA5A5] px-2 py-0.5 rounded text-ma-eggplant font-bold">
                  Heavy (5)
                </span>
                : High demand.
                <br />•{" "}
                <span className="bg-[#FDE68A] px-2 py-0.5 rounded text-ma-eggplant font-bold">
                  Normal (3)
                </span>
                : Balanced task.
                <br />•{" "}
                <span className="bg-[#A7F3D0] px-2 py-0.5 rounded text-ma-eggplant font-bold">
                  Easy (1)
                </span>
                : Minor task.
                <br />
                <br />
                Your density is the total weight against your active{" "}
                {capacityMode} budget.
              </p>

              <button
                onClick={() => setShowCapInfo(false)}
                className="w-full bg-ma-eggplant text-white py-4 rounded-full font-bold uppercase tracking-widest"
              >
                Understood
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
