"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  List, 
  Droplet, 
  Settings2, 
  HelpCircle 
} from 'lucide-react';

const THEME = {
  eggplant: '#2D1B2D',
  plum: '#4A2E45',
  cream: '#F9F7F2',
  rose: '#D6A5A5',
  sage: '#9CAF88',
  terracotta: '#C27664',
  sand: '#EAE2D6',
};

export default function Page() {
  // --- CORE TRACKER STATE ---
  const [viewDate, setViewDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'calendar' | 'table'>('calendar');
  const [allPeriods, setAllPeriods] = useState<Record<string, number[]>>({});
  const [allMoods, setAllMoods] = useState<Record<string, Record<number, string>>>({});
  const [palette, setPalette] = useState([
    { color: THEME.rose, label: 'Happy' },
    { color: THEME.sage, label: 'Productive' },
    { color: THEME.terracotta, label: 'Calm' },
    { color: '#9bf6ff', label: 'Tired' },
    { color: THEME.plum, label: 'Sad' }
  ]);
  const [activeMoodIndex, setActiveMoodIndex] = useState(0);

  // --- PERSISTENCE ---
  useEffect(() => {
    const savedPeriods = localStorage.getItem('all-periods');
    const savedMoods = localStorage.getItem('all-moods');
    const savedPalette = localStorage.getItem('mood-palette');
    if (savedPeriods) setAllPeriods(JSON.parse(savedPeriods));
    if (savedMoods) setAllMoods(JSON.parse(savedMoods));
    if (savedPalette) setPalette(JSON.parse(savedPalette));
  }, []);

  useEffect(() => {
    localStorage.setItem('all-periods', JSON.stringify(allPeriods));
    localStorage.setItem('all-moods', JSON.stringify(allMoods));
    localStorage.setItem('mood-palette', JSON.stringify(palette));
  }, [allPeriods, allMoods, palette]);

  // --- CALENDAR LOGIC ---
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const currentMonthKey = `${currentYear}-${currentMonth}`;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay();

  const togglePeriod = (mKey: string, day: number) => {
    setAllPeriods(prev => {
      const monthData = prev[mKey] || [];
      const newData = monthData.includes(day) 
        ? monthData.filter(d => d !== day) 
        : [...monthData, day].sort((a, b) => a - b);
      return { ...prev, [mKey]: newData };
    });
  };

  const averageCycle = useMemo(() => {
    const startDates: Date[] = [];
    Object.keys(allPeriods).forEach(key => {
      const [y, m] = key.split('-').map(Number);
      if (allPeriods[key]?.length > 0) startDates.push(new Date(y, m, Math.min(...allPeriods[key])));
    });
    startDates.sort((a, b) => a.getTime() - b.getTime());
    if (startDates.length < 2) return null;
    let totalDays = 0;
    for (let i = 1; i < startDates.length; i++) {
      totalDays += (startDates[i].getTime() - startDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
    }
    return Math.round(totalDays / (startDates.length - 1));
  }, [allPeriods]);

  const fullHistory = useMemo(() => {
    const keys = Object.keys(allPeriods).sort((a, b) => {
      const [yA, mA] = a.split('-').map(Number);
      const [yB, mB] = b.split('-').map(Number);
      return yB !== yA ? yB - yA : mB - mA;
    });
    return keys.map(key => {
      const [y, m] = key.split('-').map(Number);
      const days = allPeriods[key] || [];
      const ranges = [];
      if (days.length > 0) {
        let start = days[0], end = days[0];
        for (let i = 1; i <= days.length; i++) {
          if (days[i] === end + 1) end = days[i];
          else { ranges.push({ start, end }); start = days[i]; end = days[i]; }
        }
        ranges.push({ start, end });
      }
      return { key, label: new Date(y, m).toLocaleString('default', { month: 'long', year: 'numeric' }), ranges };
    }).filter(item => item.ranges.length > 0);
  }, [allPeriods]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: THEME.cream, color: THEME.eggplant, fontFamily: 'ui-rounded, "Hiragino Maru Gothic ProN", sans-serif' }}>
      
      {/* --- REFINED PURPLE HEADER --- */}
      <header style={{ backgroundColor: THEME.plum }} className="h-20 flex items-center justify-between px-10 shadow-lg z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center">
            <Calendar className="text-white w-5 h-5" />
          </div>
          <span className="text-white text-2xl" style={{ fontFamily: '"Brush Script MT", cursive' }}>Avec Ma</span>
        </div>
        <nav className="flex gap-2">
          {['Home', 'Chat', 'Messages', 'Sign In'].map((item) => (
            <button key={item} className="text-white/80 hover:text-white px-5 py-2 rounded-full text-sm font-medium transition-all hover:bg-white/10">
              {item}
            </button>
          ))}
        </nav>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-[1400px] mx-auto w-full p-8 md:p-12 grid grid-cols-12 gap-10 flex-1">
        
        {/* CALENDAR SECTION */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-5xl font-serif tracking-tight text-ma-eggplant">
                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h1>
              <p className="opacity-40 text-lg mt-2 italic">A sanctuary for your wellness tracking.</p>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setCurrentView(currentView === 'calendar' ? 'table' : 'calendar')}
                className="flex items-center gap-2 bg-white border border-ma-sand px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all font-bold text-sm">
                {currentView === 'calendar' ? <List size={18}/> : <Calendar size={18}/>}
                {currentView === 'calendar' ? 'History List' : 'Calendar View'}
              </button>
              <div className="flex bg-white/50 rounded-full p-1 border border-ma-sand">
                <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2 hover:bg-white rounded-full transition-all"><ChevronLeft/></button>
                <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2 hover:bg-white rounded-full transition-all"><ChevronRight/></button>
              </div>
            </div>
          </header>

          {currentView === 'calendar' ? (
            <div className="bg-white/40 rounded-[2.5rem] p-10 border border-white shadow-sm">
              <div className="grid grid-cols-7 gap-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d} className="text-center text-[10px] font-bold opacity-30 uppercase tracking-[.2em] mb-4">{d}</div>
                ))}

                {[...Array(startDay)].map((_, i) => <div key={`e-${i}`} />)}

                {[...Array(daysInMonth)].map((_, i) => {
                  const dayNum = i + 1;
                  const moodColor = allMoods[currentMonthKey]?.[dayNum];
                  const hasPeriod = allPeriods[currentMonthKey]?.includes(dayNum);

                  return (
                    <div key={dayNum}
                      onClick={() => setAllMoods(prev => ({...prev, [currentMonthKey]: {...prev[currentMonthKey], [dayNum]: prev[currentMonthKey]?.[dayNum] === palette[activeMoodIndex].color ? '' : palette[activeMoodIndex].color }}))}
                      className="aspect-square rounded-[1.8rem] p-3 border transition-all flex flex-col justify-between group cursor-pointer bg-white/20 hover:bg-white hover:shadow-md border-white"
                      style={{ backgroundColor: moodColor || '' }}
                    >
                      <span className="text-sm font-semibold opacity-40">{dayNum}</span>
                      <div className="flex justify-end">
                        <button 
                          onClick={(e) => { e.stopPropagation(); togglePeriod(currentMonthKey, dayNum); }}
                          className={`transition-transform hover:scale-125 ${hasPeriod ? 'text-ma-terracotta' : 'text-ma-sand/40'}`}
                        >
                          <Droplet fill={hasPeriod ? THEME.terracotta : 'transparent'} size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fullHistory.map(item => (
                <div key={item.key} className="bg-white/60 p-8 rounded-[2rem] border border-white shadow-sm">
                  <h3 className="text-2xl font-serif mb-4">{item.label}</h3>
                  <div className="space-y-3">
                    {item.ranges.map((r, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50">
                        <span className="text-sm font-medium opacity-60">{r.start} — {r.end}</span>
                        <span className="bg-ma-terracotta/10 text-ma-terracotta px-3 py-1 rounded-full text-xs font-bold">
                          {r.end - r.start + 1} Days
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SIDEBAR SECTION */}
        <div className="col-span-12 lg:col-span-4 space-y-8 mt-4">
          {/* MOOD PALETTE BENTO */}
          <div className="bg-white/60 rounded-[2rem] p-8 border border-white shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif font-bold">Mood Palette</h3>
              <Settings2 className="opacity-20 w-5 h-5" />
            </div>
            <div className="space-y-3">
              {palette.map((item, idx) => (
                <button key={idx} onClick={() => setActiveMoodIndex(idx)}
                  className={`w-full p-4 rounded-[1.5rem] flex items-center gap-4 border transition-all group
                  ${activeMoodIndex === idx ? 'bg-white border-ma-plum/10 shadow-md' : 'bg-ma-sand/20 border-transparent hover:bg-white/50'}`}>
                  <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: item.color }} />
                  <span className={`text-sm font-medium ${activeMoodIndex === idx ? 'opacity-100' : 'opacity-40'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* CYCLE STATS BENTO (CAPACITY DENSITY STYLE) */}
          <div className="bg-ma-eggplant text-ma-cream rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-[11px] uppercase tracking-[0.4em] opacity-40 font-bold">Cycle Overview</h4>
                <HelpCircle className="w-5 h-5 opacity-40" />
              </div>

              <div className="flex items-end gap-3 mb-8">
                <span className="text-7xl font-serif tracking-tighter">
                  {averageCycle || '--'}
                </span>
                <span className="text-sm uppercase font-bold tracking-widest opacity-40 mb-3">Avg Days</span>
              </div>

              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-ma-terracotta to-ma-rose h-full transition-all duration-1000 ease-out" 
                  style={{ width: averageCycle ? `${(averageCycle / 35) * 100}%` : '0%' }}
                />
              </div>
              <p className="text-[10px] mt-4 opacity-40 font-medium">Calculation based on your logged history.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center opacity-30 text-xs tracking-widest uppercase font-bold">
        Personal Health Tracker &copy; 2026 — Sanctuary for Your Time
      </footer>
    </div>
  );
}