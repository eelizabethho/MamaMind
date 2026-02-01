"use client";

import React, { useState, useEffect, useMemo } from 'react';

export default function Page() {
  const [viewDate, setViewDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'calendar' | 'table'>('calendar');
  
  const [allPeriods, setAllPeriods] = useState<Record<string, number[]>>({});
  const [allMoods, setAllMoods] = useState<Record<string, Record<number, string>>>({});
  const [palette, setPalette] = useState([
    { color: '#ffadad', label: 'Happy' },
    { color: '#ffd6a5', label: 'Productive' },
    { color: '#caffbf', label: 'Calm' },
    { color: '#9bf6ff', label: 'Tired' },
    { color: '#bdb2ff', label: 'Sad' }
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
      <main style={{ padding: "2rem", fontFamily: 'sans-serif', maxWidth: '1400px', width: '95%', margin: '0 auto', display: 'flex', gap: '3rem', flex: 1 }}>
        
        <section style={{ flex: 4 }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
              <button onClick={() => setCurrentView(currentView === 'calendar' ? 'table' : 'calendar')} style={{ marginTop: '12px', padding: '8px 16px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ddd', background: '#f9f9f9', fontSize: '0.9rem' }}>
                  {currentView === 'calendar' ? 'Switch to Comprehensive List' : 'Return to Calendar'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #eee' }}>← Previous</button>
              <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #eee' }}>Next →</button>
            </div>
          </header>

          {currentView === 'calendar' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', textAlign: 'center' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} style={{ fontWeight: '600', color: '#999', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', paddingBottom: '10px' }}>{day}</div>)}
              {[...Array(new Date(currentYear, currentMonth, 1).getDay()).fill(null), ...Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }, (_, i) => i + 1)].map((day, i) => {
                const moodColor = day ? (allMoods[currentMonthKey]?.[day]) : null;
                const hasPeriod = day ? (allPeriods[currentMonthKey]?.includes(day)) : false;
                return (
                  <div key={i} onClick={() => day && setAllMoods(prev => ({...prev, [currentMonthKey]: {...prev[currentMonthKey], [day]: prev[currentMonthKey]?.[day] === palette[activeMoodIndex].color ? '' : palette[activeMoodIndex].color }}))}
                    style={{ height: '110px', position: 'relative', borderRadius: '12px', cursor: day ? 'pointer' : 'default', backgroundColor: moodColor || (day ? '#fafafa' : 'transparent'), border: day ? '1px solid #f0f0f0' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: 'all 0.2s' }}
                  >
                    {day}
                    {day && (
                      <div onClick={(e) => { e.stopPropagation(); togglePeriod(currentMonthKey, day); }} style={{ position: 'absolute', bottom: '10px', right: '10px', cursor: 'pointer', color: hasPeriod ? '#FF4D4D' : '#e0e0e0' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5C12 2.5 6 9 6 14.5C6 17.81 8.69 20.5 12 20.5C15.31 20.5 18 17.81 18 14.5C18 9 12 2.5 12 2.5Z" /></svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {fullHistory.map(item => (
                  <div key={item.key} style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eee' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '1px solid #f5f5f5', paddingBottom: '10px' }}>{item.label}</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr style={{ color: '#aaa', fontSize: '0.7rem', textAlign: 'left' }}><th>START</th><th>END</th><th>DAYS</th></tr></thead>
                      <tbody>
                        {item.ranges.map((r, i) => (
                          <tr key={i} style={{ fontSize: '0.9rem' }}>
                            <td style={{ padding: '8px 0' }}>{r.start}</td>
                            <td style={{ padding: '8px 0' }}>{r.end}</td>
                            <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#FF4D4D' }}>{r.end - r.start + 1}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside style={{ flex: 1, padding: '2rem', backgroundColor: '#fcfcfc', borderRadius: '20px', border: '1px solid #f0f0f0', alignSelf: 'flex-start' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.2rem' }}>Mood Palette</h3>
          {palette.map((item, idx) => (
            <div key={idx} onClick={() => setActiveMoodIndex(idx)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', cursor: 'pointer', border: activeMoodIndex === idx ? '2px solid #333' : '1px solid #eee', backgroundColor: '#fff', marginBottom: '10px' }}>
              <input type="color" value={item.color} onChange={(e) => { const p = [...palette]; p[idx].color = e.target.value; setPalette(p); }} style={{ border: 'none', width: '28px', height: '28px', cursor: 'pointer', borderRadius: '4px' }} />
              <input type="text" value={item.label} onChange={(e) => { const p = [...palette]; p[idx].label = e.target.value; setPalette(p); }} style={{ border: 'none', flex: 1, fontSize: '0.9rem', fontWeight: activeMoodIndex === idx ? '600' : '400' }} />
            </div>
          ))}
          <p style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '2rem', lineHeight: '1.4' }}>
            Select a mood above and tap a date to track. Tap the droplet icon for cycle tracking.
          </p>
        </aside>
      </main>

      <footer style={{ padding: '1.5rem 3rem', borderTop: '1px solid #f0f0f0', color: '#666', fontSize: '0.9rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Personal Health Tracker &copy; 2026</span>
          <span style={{ fontWeight: '500' }}>
            Average Cycle Length: <span style={{ color: '#FF4D4D', fontWeight: 'bold', marginLeft: '5px' }}>{averageCycle ? `${averageCycle} Days` : 'Not enough data yet'}</span>
          </span>
        </div>
      </footer>
    </div>
  );
}