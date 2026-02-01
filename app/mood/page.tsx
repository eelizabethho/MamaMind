"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  List, 
  Droplet, 
  Settings2, 
  HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const THEME = {
  eggplant: '#2D1B2D',
  plum: '#4A2E45',
  cream: '#ECE0DA', 
  rose: '#D6A5A5',
  sage: '#9CAF88',
  terracotta: '#C27664',
  sand: '#F1C8CB', 
};

function ProfilePictureEditor({ currentImage, onImageChange, userName }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  useEffect(() => { setPreview(currentImage); }, [currentImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative inline-block">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        onClick={() => fileInputRef.current?.click()}
        className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-white/50 cursor-pointer shadow-xl bg-ma-plum flex items-center justify-center text-white text-4xl font-serif"
      >
        {preview ? <img src={preview} alt="Profile" className="w-full h-full object-cover" /> : (userName?.charAt(0) || 'U')}
      </motion.div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      <div className="absolute bottom-0 right-0 bg-[#C27664] p-2 rounded-full border-2 border-white shadow-md">
        <Settings2 size={16} color="white" />
      </div>
    </div>
  );
}

function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [pfp, setPfp] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      setPfp(localStorage.getItem(`profile_image_${session.user.email}`));
    }
  }, [session]);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Chat", href: "/gemini" },
    { label: "Calendar", href: "/calendar" },
    { label: "Mood", href: "/mood" },
    { label: "Finance", href: "/finance" },
  ];

  return (
    <nav className="sticky top-0 z-[100] flex justify-between items-center px-12 py-4 bg-[#51295b] shadow-xl border-b border-white/10">
      <Link href="/" className="flex items-center gap-4 group">
        <div className="w-[50px] h-[50px] rounded-full border-2 border-white/20 overflow-hidden">
          <Image src="/logo.png" alt="Logo" width={50} height={50} />
        </div>
        <span className="text-2xl text-[#f5f5f0] font-serif italic" style={{ fontFamily: 'cursive' }}>Avec Ma</span>
      </Link>

      <div className="flex gap-4 items-center">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} 
            className={`px-4 py-2 rounded-xl text-sm transition-all border ${pathname === item.href ? 'bg-white/20 border-white/30 text-white font-bold' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
            {item.label}
          </Link>
        ))}
        {session ? (
          <div className="flex items-center gap-3 ml-4">
            <Image src={pfp || session.user?.image || ''} alt="User" width={40} height={40} className="rounded-full border border-white/20" />
            <button onClick={() => signOut()} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg border border-white/20">Sign Out</button>
          </div>
        ) : (
          <button onClick={() => signIn("google")} className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm border border-white/30 ml-4">Sign In</button>
        )}
      </div>
    </nav>
  );
}

export default function Page() {
  const { data: session } = useSession();
  const [viewDate, setViewDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'calendar' | 'table'>('calendar');
  const [allPeriods, setAllPeriods] = useState<Record<string, number[]>>({});
  const [allMoods, setAllMoods] = useState<Record<string, Record<number, string>>>({});
  const [palette] = useState([
    { color: '#D6A5A5', label: 'Happy' },
    { color: '#9CAF88', label: 'Productive' },
    { color: '#C27664', label: 'Calm' },
    { color: '#9bf6ff', label: 'Tired' },
    { color: '#4A2E45', label: 'Sad' }
  ]);
  const [activeMoodIndex, setActiveMoodIndex] = useState(0);

  const userKey = session?.user?.email || "guest";

  useEffect(() => {
    const periods = localStorage.getItem(`${userKey}_periods`);
    const moods = localStorage.getItem(`${userKey}_moods`);
    if (periods) setAllPeriods(JSON.parse(periods));
    if (moods) setAllMoods(JSON.parse(moods));
  }, [userKey]);

  useEffect(() => {
    localStorage.setItem(`${userKey}_periods`, JSON.stringify(allPeriods));
    localStorage.setItem(`${userKey}_moods`, JSON.stringify(allMoods));
  }, [allPeriods, allMoods, userKey]);

  // --- LOGIC FOR HISTORY LIST ---
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
        for (let i = 1; i < days.length; i++) {
          if (days[i] === end + 1) {
            end = days[i];
          } else {
            ranges.push({ start, end });
            start = days[i];
            end = days[i];
          }
        }
        ranges.push({ start, end });
      }
      return { 
        key, 
        label: new Date(y, m).toLocaleString('default', { month: 'long', year: 'numeric' }), 
        ranges 
      };
    }).filter(item => item.ranges.length > 0);
  }, [allPeriods]);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const currentMonthKey = `${currentYear}-${currentMonth}`;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay();

  const togglePeriod = (mKey: string, day: number) => {
    setAllPeriods(prev => {
      const monthData = prev[mKey] || [];
      const newData = monthData.includes(day) ? monthData.filter(d => d !== day) : [...monthData, day].sort((a, b) => a - b);
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

  return (
    <div className="min-h-screen flex flex-col" style={{ 
      background: "linear-gradient(180deg, #ECE0DA 0%, #F1C8CB 50%, #ECE0DA 100%)" 
    }}>
      <Navbar />
      
      <main className="max-w-[1400px] mx-auto w-full p-8 md:p-16 flex-1">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-6xl font-serif tracking-tight text-[#2D1B2D]">
              {currentView === 'calendar' ? viewDate.toLocaleString('default', { month: 'long', year: 'numeric' }) : "Journey History"}
            </h1>
            <p className="opacity-60 text-xl font-light italic mt-2 text-[#2D1B2D]">A sanctuary for your wellness tracking.</p>
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => setCurrentView(currentView === 'calendar' ? 'table' : 'calendar')} 
              className="flex items-center gap-3 bg-white/40 hover:bg-white border border-white px-8 py-4 rounded-full shadow-lg transition-all font-bold text-sm">
              {currentView === 'calendar' ? <List size={20}/> : <Calendar size={20}/>}
              {currentView === 'calendar' ? 'View History' : 'Back to Calendar'}
            </button>
            {currentView === 'calendar' && (
              <div className="flex bg-white/40 rounded-full p-1 border border-white">
                <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-3 hover:bg-white rounded-full transition-all"><ChevronLeft/></button>
                <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-3 hover:bg-white rounded-full transition-all"><ChevronRight/></button>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-8">
            <AnimatePresence mode="wait">
              {currentView === 'calendar' ? (
                <motion.div 
                  key="calendar"
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white/30 rounded-[3rem] p-10 border border-white shadow-xl backdrop-blur-sm"
                >
                  <div className="grid grid-cols-7 gap-6">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                      <div key={d} className="text-center text-[10px] font-bold opacity-30 uppercase tracking-[.2em] mb-4 text-[#2D1B2D]">{d}</div>
                    ))}
                    {[...Array(startDay)].map((_, i) => <div key={`e-${i}`} />)}
                    {[...Array(daysInMonth)].map((_, i) => {
                      const dayNum = i + 1;
                      const moodColor = allMoods[currentMonthKey]?.[dayNum];
                      const hasPeriod = allPeriods[currentMonthKey]?.includes(dayNum);
                      return (
                        <motion.div key={dayNum}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setAllMoods(prev => ({...prev, [currentMonthKey]: {...prev[currentMonthKey], [dayNum]: moodColor === palette[activeMoodIndex].color ? '' : palette[activeMoodIndex].color }}))}
                          className="aspect-square rounded-[2rem] p-4 border transition-all flex flex-col justify-between group cursor-pointer border-white shadow-sm"
                          style={{ backgroundColor: moodColor || 'rgba(255,255,255,0.15)' }}
                        >
                          <span className="text-sm font-semibold opacity-40 text-[#2D1B2D]">{dayNum}</span>
                          <div className="flex justify-end">
                            <button onClick={(e) => { e.stopPropagation(); togglePeriod(currentMonthKey, dayNum); }}
                              className={`transition-all ${hasPeriod ? 'text-[#C27664]' : 'text-white/40'}`}
                            >
                              <Droplet fill={hasPeriod ? '#C27664' : 'transparent'} size={22} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="history"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {fullHistory.length > 0 ? fullHistory.map(item => (
                    <div key={item.key} className="bg-white/40 p-8 rounded-[2.5rem] border border-white shadow-lg backdrop-blur-sm">
                      <h3 className="text-2xl font-serif mb-6 text-[#2D1B2D]">{item.label}</h3>
                      <div className="space-y-4">
                        {item.ranges.map((r, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white/30 p-5 rounded-2xl border border-white/50">
                            <span className="text-sm font-medium text-[#2D1B2D] opacity-70">
                              {item.label.split(' ')[0]} {r.start} — {r.end}
                            </span>
                            <span className="bg-[#C27664]/10 text-[#C27664] px-4 py-1.5 rounded-full text-xs font-bold border border-[#C27664]/20">
                              {r.end - r.start + 1} Days
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-2 text-center py-20 bg-white/20 rounded-[3rem] border border-dashed border-white/50">
                      <p className="text-xl opacity-40 font-serif italic">Your story begins here. Log your first period on the calendar.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-white/40 rounded-[2.5rem] p-10 border border-white shadow-lg text-center backdrop-blur-sm">
              <ProfilePictureEditor 
                currentImage={session?.user?.email ? localStorage.getItem(`profile_image_${session.user.email}`) : null}
                userName={session?.user?.name}
                onImageChange={(img: string) => { if(session?.user?.email) localStorage.setItem(`profile_image_${session.user.email}`, img); window.location.reload(); }}
              />
              <h3 className="mt-6 text-2xl font-serif font-bold text-[#2D1B2D]">{session?.user?.name || 'Guest'}</h3>
              <p className="text-sm opacity-40 uppercase tracking-widest mt-2">Personal Sanctuary</p>
            </div>

            <div className="bg-white/40 rounded-[2.5rem] p-8 border border-white shadow-lg backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif font-bold text-[#2D1B2D]">Mood Palette</h3>
                <Settings2 className="opacity-20 w-5 h-5" />
              </div>
              <div className="space-y-3">
                {palette.map((item, idx) => (
                  <button key={idx} onClick={() => setActiveMoodIndex(idx)}
                    className={`w-full p-4 rounded-[1.5rem] flex items-center gap-4 border transition-all
                    ${activeMoodIndex === idx ? 'bg-white border-[#2D1B2D]/10 shadow-md scale-[1.02]' : 'bg-white/20 border-transparent hover:bg-white/40'}`}>
                    <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: item.color }} />
                    <span className={`text-sm font-medium ${activeMoodIndex === idx ? 'opacity-100 font-bold' : 'opacity-40'}`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#2D1B2D] text-[#ECE0DA] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
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
                <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: averageCycle ? `${(averageCycle / 35) * 100}%` : '0%' }}
                    className="bg-gradient-to-r from-[#C27664] to-[#D6A5A5] h-full" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-12 text-center opacity-30 text-xs tracking-widest uppercase font-bold text-[#2D1B2D]">
        Personal Health Tracker &copy; 2026 — Sanctuary for Your Time
      </footer>
    </div>
  );
}