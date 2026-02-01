"use client";
import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertCircle,
  Circle,
} from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-ma-cream p-8 md:p-16 relative overflow-hidden">
      {/* BACKGROUND LOGO WATERMARK */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 opacity-[0.03] pointer-events-none -z-10">
        <img
          src="/image_6c2e66.png"
          alt="Logo"
          className="w-[800px] h-[800px] object-contain"
        />
      </div>

      {/* HEADER */}
      <div className="max-w-[1400px] mx-auto mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-6xl font-serif text-ma-eggplant mb-2 tracking-tight">
            My Scheduler
          </h1>
          <p className="text-ma-plum italic opacity-70 text-xl font-light">
            A sanctuary for your time.
          </p>
        </div>

        {/* ADD EVENT BUTTON with Highlight Hover */}
        <button
          className="flex items-center gap-3 bg-ma-terracotta text-white px-10 py-4 rounded-full 
          shadow-[0_10px_25px_-5px_rgba(194,118,100,0.4)] transition-all duration-300
          hover:scale-105 hover:shadow-[0_20px_35px_-5px_rgba(194,118,100,0.5)] hover:brightness-110 active:scale-95 font-semibold text-lg"
        >
          <Plus className="w-6 h-6 stroke-[3px]" /> Add Event
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-10 items-start">
        {/* LEFT COLUMN: Calendar */}
        <div className="col-span-12 lg:col-span-8 bg-ma-sand/60 backdrop-blur-md rounded-ma p-12 shadow-sm border border-white/60">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-serif">January 2026</h2>
            <div className="flex gap-4">
              <button className="p-4 rounded-full border border-ma-plum/10 hover:bg-white/60 transition-all">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button className="p-4 rounded-full border border-ma-plum/10 hover:bg-white/60 transition-all">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-8 text-center text-[11px] uppercase tracking-[0.3em] font-bold text-ma-plum/40">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-5">
            {[...Array(31)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-[2rem] p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between group
                ${
                  i === 30
                    ? "bg-ma-sage/30 border-ma-sage/40 scale-105 shadow-md"
                    : i === 12 || i === 24
                      ? "bg-ma-rose/30 border-ma-rose/40"
                      : "bg-white/40 border-white/30 hover:bg-white/80 hover:scale-105 shadow-sm"
                }`}
              >
                <span className="text-lg font-medium opacity-60">{i + 1}</span>
                {(i === 12 || i === 30) && (
                  <div className="w-full h-1.5 bg-ma-plum/20 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Widgets */}
        <div className="col-span-12 lg:col-span-4 space-y-10">
          {/* Priorities Widget */}
          <div className="bg-white/60 backdrop-blur-xl rounded-ma p-10 border border-white shadow-sm">
            <h3 className="text-2xl font-serif mb-8 flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-ma-terracotta" />
              Top 3 Priorities
            </h3>
            <div className="space-y-5">
              {["Pediatrician Checkup", "Call Insurance", "Meal Prep"].map(
                (task, idx) => (
                  <div
                    key={idx}
                    className="bg-ma-sand/30 p-6 rounded-[1.8rem] border border-white/50 flex items-center justify-between group hover:bg-white transition-all cursor-pointer"
                  >
                    <span className="font-medium text-lg text-ma-eggplant/80">
                      {task}
                    </span>
                    <Circle className="w-6 h-6 text-ma-plum/20 group-hover:text-ma-rose transition-all" />
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Capacity Card */}
          <div className="bg-ma-eggplant text-ma-cream rounded-ma p-12 shadow-2xl relative overflow-hidden min-h-[280px] flex flex-col justify-center">
            <div className="relative z-10">
              <h4 className="text-[10px] uppercase tracking-[0.4em] opacity-50 mb-3 font-bold">
                Today's Capacity
              </h4>
              <div className="text-6xl font-serif mb-8 text-white">65%</div>
              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-ma-terracotta to-ma-rose h-full w-[65%] rounded-full shadow-[0_0_20px_rgba(214,165,165,0.4)]" />
              </div>
              <p className="text-base mt-8 italic text-ma-rose/90 font-light">
                You're doing great, Mama.
              </p>
            </div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-ma-rose/20 blur-[100px] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
