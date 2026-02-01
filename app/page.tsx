"use client"; // Required for tabs/state
import { useState } from 'react';
import MoodTracker from './mood-period-tracker';
// import Calendar from '@/components/calendar'; // Your friends will add these later

export default function Home() {
  const [activeTab, setActiveTab] = useState('mood');

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Super App</h1>

      {/* Tab Navigation */}
      <nav className="flex gap-4 mb-8 border-b">
        <button onClick={() => setActiveTab('calendar')}>Calendar</button>
        <button onClick={() => setActiveTab('finance')}>Finance</button>
        <button onClick={() => setActiveTab('mood')}>Mood</button>
        <button onClick={() => setActiveTab('chat')}>AI Chat</button>
      </nav>

      {/* Tab Content */}
      <div className="content-area">
        {activeTab === 'calendar' && <div>Calendar Component goes here</div>}
        {activeTab === 'finance' && <div>Finance Component goes here</div>}
        {activeTab === 'mood' && <MoodTracker />} 
        {activeTab === 'chat' && <div>Chatbot goes here</div>}
      </div>
    </main>
  );
}