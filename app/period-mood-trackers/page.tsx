"use client";

import React, { useState, useEffect, useMemo } from 'react';

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

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const currentMonthKey = `${currentYear}-${currentMonth}`;

  const togglePeriod = (mKey: string, day: number) => {
    setAllPeriods(prev => {
      const monthData = prev[mKey] || [];
      const newData = monthData.includes(day) 
        ? monthData.filter(d => d !== day) 
        : [...monthData, day].sort((a, b) => a - b);
      return { ...prev, [mKey]: newData };
    });
  };

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
          if (days[i] === end + 1) { end = days[i]; } 
          else { ranges.push({ start, end }); start = days[i]; end = days[i]; }
        }
      }
      return { key, label: new Date(y, m).toLocaleString('default', { month: 'long', year: 'numeric' }), ranges };
    }).filter(item => item.ranges.length > 0);
  }, [allPeriods]);

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: THEME.cream, color: THEME.eggplant }}>
      
      {/* --- PURPLE HEADER FROM IMAGE --- */}
      <header style={{
        backgroundColor: THEME.plum,
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
               <path d="M12 21c-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8s8 3.582 8 8c0 4.418-3.582 8-8 8z" />
               <path d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
            </svg>
          </div>
          <span style={{ color: 'white', fontSize: '26px', fontFamily: '"Brush Script MT", cursive' }}>Avec Ma</span>
        </div>

        <nav style={{ display: 'flex', gap: '10px' }}>
          {['Home', 'Chat', 'Messages', 'Sign In'].map((item) => (
            <button key={item} style={{
              background: item === 'Home' ? 'rgba(255,255,255,0.15)' : 'transparent',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 18px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>{item}</button>
          ))}
        </nav>
      </header>

      {/* --- ORIGINAL CONTENT --- */}
      <main style={{ padding: "3rem 2rem", fontFamily: 'ui-rounded, "Hiragino Maru Gothic ProN", sans-serif', maxWidth: '1400px', width: '95%', margin: '0 auto', display: 'flex', gap: '3rem', flex: 1 }}>
        <section style={{ flex: 4 }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: THEME.plum }}>{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
              <button onClick={() => setCurrentView(currentView === 'calendar' ? 'table' : 'calendar')} style={{ marginTop: '12px', padding: '8px 16px', cursor: 'pointer', borderRadius: '12px', border: `2px solid ${THEME.sand}`, background: '#fff', color: THEME.plum, fontSize: '0.9rem', fontWeight: '600' }}>
                  {currentView === 'calendar' ? '✨ View History' : '📅 Back to Calendar'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '12px', border: 'none', background: THEME.sand, color: THEME.eggplant, fontWeight: 'bold' }}>←</button>
              <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '12px', border: 'none', background: THEME.sand, color: THEME.eggplant, fontWeight: 'bold' }}>→</button>
            </div>
          </header>

          {currentView === 'calendar' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', textAlign: 'center' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} style={{ fontWeight: '700', color: THEME.rose, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '2px', paddingBottom: '10px' }}>{day}</div>)}
              {[...Array(new Date(currentYear, currentMonth, 1).getDay()).fill(null), ...Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }, (_, i) => i + 1)].map((day, i) => {
                const moodColor = day ? (allMoods[currentMonthKey]?.[day]) : null;
                const hasPeriod = day ? (allPeriods[currentMonthKey]?.includes(day)) : false;
                return (
                  <div key={i} onClick={() => day && setAllMoods(prev => ({...prev, [currentMonthKey]: {...prev[currentMonthKey], [day]: prev[currentMonthKey]?.[day] === palette[activeMoodIndex].color ? '' : palette[activeMoodIndex].color }}))}
                    style={{ height: '110px', position: 'relative', borderRadius: '16px', cursor: day ? 'pointer' : 'default', backgroundColor: moodColor || (day ? '#fff' : 'transparent'), border: day ? `2px solid ${THEME.sand}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '600' }}>
                    {day}
                    {day && (
                      <div onClick={(e) => { e.stopPropagation(); togglePeriod(currentMonthKey, day); }} style={{ position: 'absolute', bottom: '10px', right: '10px', cursor: 'pointer', color: hasPeriod ? THEME.terracotta : THEME.sand }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5C12 2.5 6 9 6 14.5C6 17.81 8.69 20.5 12 20.5C15.31 20.5 18 17.81 18 14.5C18 9 12 2.5 12 2.5Z" /></svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {fullHistory.map(item => (
                  <div key={item.key} style={{ background: '#fff', padding: '1.5rem', borderRadius: '24px', border: `2px solid ${THEME.sand}` }}>
                    <h3 style={{ marginTop: 0, color: THEME.plum }}>{item.label}</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr style={{ color: THEME.rose, fontSize: '0.75rem', textAlign: 'left' }}><th>START</th><th>END</th><th>DAYS</th></tr></thead>
                      <tbody>
                        {item.ranges.map((r, i) => (
                          <tr key={i} style={{ fontSize: '0.9rem' }}><td style={{ padding: '8px 0' }}>{r.start}</td><td style={{ padding: '8px 0' }}>{r.end}</td><td style={{ padding: '8px 0', fontWeight: 'bold', color: THEME.terracotta }}>{r.end - r.start + 1}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside style={{ flex: 1, padding: '2rem', backgroundColor: '#fff', borderRadius: '32px', border: `3px solid ${THEME.sand}`, alignSelf: 'flex-start', marginTop: '68px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.2rem', color: THEME.plum, textAlign: 'center' }}>Mood Palette</h3>
          {palette.map((item, idx) => (
            <div key={idx} onClick={() => setActiveMoodIndex(idx)} 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', cursor: 'pointer', border: activeMoodIndex === idx ? `3px solid ${THEME.plum}` : `2px solid ${THEME.cream}`, backgroundColor: activeMoodIndex === idx ? THEME.cream : '#fff', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: item.color, border: `2px solid ${THEME.sand}`, position: 'relative', overflow: 'hidden' }}>
                <input type="color" value={item.color} onChange={(e) => { const p = [...palette]; p[idx].color = e.target.value; setPalette(p); }} style={{ position: 'absolute', opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
              </div>
              <input type="text" value={item.label} onChange={(e) => { const p = [...palette]; p[idx].label = e.target.value; setPalette(p); }} style={{ border: 'none', background: 'transparent', flex: 1, fontSize: '0.95rem', fontWeight: activeMoodIndex === idx ? '700' : '500', color: THEME.plum, outline: 'none' }} />
            </div>
          ))}
        </aside>
      </main>

      <footer style={{ padding: '1.5rem 3rem', background: THEME.plum, color: THEME.sand, fontSize: '0.9rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Personal Health Tracker &copy; 2026</span>
          <span style={{ fontWeight: '600', backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '20px' }}>
            Avg Cycle: <span style={{ color: THEME.rose, fontWeight: '800', marginLeft: '5px' }}>{averageCycle ? `${averageCycle} Days` : '...'}</span>
          </span>
        </div>
      </footer>
    </div>
  );
}