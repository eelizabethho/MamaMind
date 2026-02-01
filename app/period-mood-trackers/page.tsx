"use client";

import React, { useState, useEffect } from 'react';

export default function Page() {
  const [viewDate, setViewDate] = useState(new Date());
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  // Storage Keys
  const periodKey = `period-${year}-${month}`;
  const moodKey = `moods-${year}-${month}`;
  const paletteKey = `mood-palette`;

  // --- State ---
  const [periodDays, setPeriodDays] = useState<number[]>([]);
  const [dailyMoods, setDailyMoods] = useState<Record<number, string>>({});
  const [palette, setPalette] = useState([
    { color: '#ffadad', label: 'Happy' },
    { color: '#ffd6a5', label: 'Productive' },
    { color: '#caffbf', label: 'Calm' },
    { color: '#9bf6ff', label: 'Tired' },
    { color: '#bdb2ff', label: 'Sad' }
  ]);
  const [activeMoodIndex, setActiveMoodIndex] = useState(0);

  // 1. Load Data
  // Dependencies are explicitly defined and won't change size
  useEffect(() => {
    const savedPeriods = localStorage.getItem(periodKey);
    const savedMoods = localStorage.getItem(moodKey);
    const savedPalette = localStorage.getItem(paletteKey);
    
    setPeriodDays(savedPeriods ? JSON.parse(savedPeriods) : []);
    setDailyMoods(savedMoods ? JSON.parse(savedMoods) : {});
    if (savedPalette) setPalette(JSON.parse(savedPalette));
  }, [periodKey, moodKey, paletteKey]); 

  // 2. Save Data
  useEffect(() => {
    localStorage.setItem(periodKey, JSON.stringify(periodDays));
    localStorage.setItem(moodKey, JSON.stringify(dailyMoods));
    localStorage.setItem(paletteKey, JSON.stringify(palette));
  }, [periodDays, dailyMoods, palette, periodKey, moodKey, paletteKey]);

  // --- Handlers ---
  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const currentColor = palette[activeMoodIndex].color;
    setDailyMoods(prev => {
      const next = { ...prev };
      if (next[day] === currentColor) {
        delete next[day];
      } else {
        next[day] = currentColor;
      }
      return next;
    });
  };

  const togglePeriod = (e: React.MouseEvent, day: number) => {
    e.stopPropagation(); 
    setPeriodDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const updatePalette = (index: number, field: 'color' | 'label', value: string) => {
    const newPalette = [...palette];
    newPalette[index] = { ...newPalette[index], [field]: value };
    setPalette(newPalette);
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(year, month + offset, 1));
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const calendarCells = [
    ...Array(firstDayIndex).fill(null), 
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  return (
    <main style={{ padding: "2rem", fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '2rem' }}>
      
      {/* Calendar Section */}
      <section style={{ flex: 3 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => changeMonth(-1)} style={{ padding: '5px 15px', cursor: 'pointer' }}>←</button>
            <button onClick={() => changeMonth(1)} style={{ padding: '5px 15px', cursor: 'pointer' }}>→</button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ fontWeight: 'bold', paddingBottom: '10px', color: '#666' }}>{day}</div>
          ))}

          {calendarCells.map((day, i) => {
            const moodColor = day ? dailyMoods[day] : null;
            const hasPeriod = day ? periodDays.includes(day) : false;

            return (
              <div 
                key={i}
                onClick={() => handleDayClick(day)}
                style={{ 
                  height: '80px',
                  position: 'relative',
                  borderRadius: '8px',
                  cursor: day ? 'pointer' : 'default',
                  backgroundColor: moodColor || (day ? '#fdfdfd' : 'transparent'),
                  border: day ? '1px solid #eee' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  transition: 'background-color 0.2s'
                }}
              >
                {day}
                
                {day && (
                  <div 
                    onClick={(e) => togglePeriod(e, day)}
                    style={{
                      position: 'absolute',
                      bottom: '6px',
                      right: '6px',
                      cursor: 'pointer',
                      // Pure Red when active, very light gray when inactive
                      color: hasPeriod ? '#FF0000' : '#E8E8E8',
                      transition: 'color 0.2s'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.5C12 2.5 6 9 6 14.5C6 17.81 8.69 20.5 12 20.5C15.31 20.5 18 17.81 18 14.5C18 9 12 2.5 12 2.5Z" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Mood Sidebar */}
      <aside style={{ flex: 1, padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '12px', minWidth: '250px' }}>
        <h3 style={{ marginTop: 0 }}>Moods</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {palette.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => setActiveMoodIndex(idx)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                border: activeMoodIndex === idx ? '2px solid #000' : '1px solid #ddd',
                backgroundColor: '#fff'
              }}
            >
              <input 
                type="color" 
                value={item.color} 
                onChange={(e) => updatePalette(idx, 'color', e.target.value)}
                style={{ border: 'none', width: '24px', height: '24px', cursor: 'pointer', background: 'none' }}
              />
              <input 
                type="text" 
                value={item.label} 
                onChange={(e) => updatePalette(idx, 'label', e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem' }}
              />
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', marginTop: '2rem', color: '#888', fontStyle: 'italic' }}>
          Tip: Tap the droplet on a day to mark your period (Red = Active).
        </p>
      </aside>
    </main>
  );
}