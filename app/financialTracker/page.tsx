"use client";

// Imported necessary libraries. 
//UseState helps for state management, useMemo for memoizing values, and useEffect for saving data, etc. 

import React, { useState, useMemo, useEffect } from 'react';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useSession } from "next-auth/react";
import { FinancialAreaChart } from "../components/charts/FinancialAreaChart";
import { FinancialPieChart } from "../components/charts/FinancialPieChart";

//Added categories of transactions
type TransactionType = 'income' | 'expense' | 'bill';

//Defined structure of a transaction
interface Transaction {
  id: number;
  label: string;
  amount: number;
  type: TransactionType;
  month: string;
  isPaid: boolean;
}

export default function FinanceTracker() {
  //constant variables needed for this webpage such as months, lables, etc.  
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  //Active Month: tracks the months 
  const [activeMonth, setActiveMonth] = useState("January");

  //Transactions: array that holds every income, expense, and bill
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  //track input fields and editing state
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  //Loads the page, and saves data.
  useEffect(() => {
    const saved = localStorage.getItem('avec-ma-finance-v4');
    if (saved) {
      try { setTransactions(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  //Whenever an edit is made, it saves the data, turns it into a string JSON, and saves it in
  //browser's hard drive
  useEffect(() => {
    localStorage.setItem('avec-ma-finance-v4', JSON.stringify(transactions));
  }, [transactions]);

  //Function to save an entry, either new or edited
  const saveEntry = (type: TransactionType) => {
    //turns amount string into a number
    const val = parseFloat(amount);
    if (!label.trim() || isNaN(val)) return;

    //it takes care of the editing function from the history
    if (editingId) {
      setTransactions(prev => prev.map(t => 
        t.id === editingId ? { ...t, label: label.trim(), amount: val, type } : t
      ));
      setEditingId(null);
    } else {
      setTransactions([{ id: Date.now(), label: label.trim(), amount: val, type, month: activeMonth, isPaid: false }, ...transactions]);
    }
    setLabel(""); setAmount("");
  };

  //function to clear all transaction for the active month while saving rest of the months' data
  const clearAllTransactions = () => {
    if (confirm(`Are you sure you want to clear all history for ${activeMonth}? This cannot be undone.`)) {
      setTransactions(prev => prev.filter(t => t.month !== activeMonth));
    }
  };

  // Filters transaction based on the active month
  const monthlyData = useMemo(() => transactions.filter(t => t.month === activeMonth), [transactions, activeMonth]);

  //Calculates the money left to spend after expenses and bills. 
  const stats = useMemo(() => {

    //Calculates the income
    const income = monthlyData.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);

    //Calculates expenses
    const expenses = monthlyData.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

    //Calculates paid bills
    const paidBills = monthlyData.filter(t => t.type === 'bill' && t.isPaid).reduce((a, b) => a + b.amount, 0);

    //returns an object which is the result of the formula: 
    //Income - Expenses - PaidBills = totalMoneyLeft. 
    return { safe: income - expenses - paidBills };
  }, [monthlyData]);

  return (
    <div className="min-h-screen flex flex-col" style={{ 
      background: "linear-gradient(180deg, #ECE0DA 0%, #F1C8CB 50%, #ECE0DA 100%)" 
    }}>
      <Navbar />

      <main className="max-w-[1400px] mx-auto w-full p-8 md:p-16 flex-1">
        <header className="mb-12">
          <h1 className="text-6xl font-serif tracking-tight text-[#2D1B2D]">
            Financial Sanctuary
          </h1>
          <p className="opacity-60 text-xl font-light italic mt-2 text-[#2D1B2D]">
            A sanctuary for your abundance tracking.
          </p>
        </header>

        <div className="grid grid-cols-12 gap-10">
          
          {/* CALENDAR-STYLE MONTH GRID */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white/30 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white shadow-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2d1b2d]/40 mb-4 px-1 text-center">Select Month</p>
              <div className="grid grid-cols-3 gap-2">
                {months.map(m => (
                  <button 
                    key={m} 
                    onClick={() => setActiveMonth(m)}
                    className={`aspect-square flex items-center justify-center rounded-2xl text-[10px] font-bold transition-all border ${
                      activeMonth === m 
                      ? 'bg-[#2d1b2d] text-white border-[#2d1b2d] shadow-lg scale-105' 
                      : 'bg-white/50 text-[#2d1b2d]/60 border-white hover:bg-white'
                    }`}
                  >
                    {m.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/*CENTER: MAIN TRACKER*/}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            <div className="bg-white/40 backdrop-blur-md p-12 rounded-[3.5rem] text-center shadow-xl border border-white">
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#2d1b2d]/50">Money Left • {activeMonth}</p>
              <h2 className={`text-7xl font-serif mt-2 tracking-tighter ${stats.safe < 0 ? 'text-[#c27664]' : 'text-[#2d1b2d]'}`}>
                ${stats.safe.toFixed(2)}
              </h2>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6">
              <FinancialAreaChart transactions={transactions} />
              <FinancialPieChart transactions={transactions} activeMonth={activeMonth} />
            </div>

            <div className={`bg-white/60 backdrop-blur-sm p-6 rounded-[2.5rem] border-2 transition-all shadow-lg ${editingId ? 'border-[#9caf88]' : 'border-white'}`}>
              <div className="flex gap-2 mb-4">
                <input className="flex-1 p-4 rounded-2xl bg-white/50 border border-white outline-none text-sm" placeholder="Label" value={label} onChange={e => setLabel(e.target.value)} />
                <input className="w-28 p-4 rounded-2xl bg-white/50 border border-white outline-none text-sm font-bold" type="number" placeholder="$" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => saveEntry('income')} className="bg-[#9caf88] text-white p-4 rounded-xl font-bold uppercase text-[10px] hover:opacity-90 transition-all">Income</button>
                <button onClick={() => saveEntry('expense')} className="bg-[#d6a5a5] text-[#2d1b2d] p-4 rounded-xl font-bold uppercase text-[10px] hover:opacity-90 transition-all">Expense</button>
                <button onClick={() => saveEntry('bill')} className="bg-[#2d1b2d] text-white p-4 rounded-xl font-bold uppercase text-[10px] hover:opacity-90 transition-all">Bill</button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#2d1b2d]/60 px-2">Upcoming Bills</h3>
              {monthlyData.filter(t => t.type === 'bill').map(bill => (
                <div key={bill.id} className="flex justify-between items-center p-5 bg-white/60 backdrop-blur-sm border border-white rounded-[1.5rem] shadow-sm">
                  <div className="flex items-center gap-4">
                    <input type="checkbox" checked={bill.isPaid} onChange={() => setTransactions(prev => prev.map(t => t.id === bill.id ? {...t, isPaid: !t.isPaid} : t))} className="w-5 h-5 accent-[#9caf88]" />
                    <span className={`font-medium ${bill.isPaid ? 'line-through opacity-30' : ''}`}>{bill.label}</span>
                  </div>
                  <span className="font-bold">${bill.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/*HISTORY WITH CLEAR ALL*/}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-[#2d1b2d] text-[#ece0da] p-8 rounded-[3rem] shadow-2xl min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xs uppercase tracking-widest opacity-60">Activity</h3>
                {monthlyData.length > 0 && (
                  <button 
                    onClick={clearAllTransactions}
                    className="text-[9px] font-bold uppercase text-[#d6a5a5] hover:underline tracking-wider"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
                {monthlyData.length === 0 ? (
                  <p className="text-[10px] italic opacity-40 text-center py-10">No transactions yet</p>
                ) : (
                  monthlyData.map(t => (
                    <div key={t.id} className="p-4 bg-white/10 rounded-2xl border border-white/10 text-xs">
                      <div className="flex justify-between font-bold mb-1 text-white">
                        <span>{t.label}</span>
                        <span className={t.type === 'income' ? 'text-[#9caf88]' : 'text-[#d6a5a5]'}>${t.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center opacity-40 text-[9px]">
                        <span className="uppercase font-black">{t.type}</span>
                        <div className="flex gap-2">
                          <button onClick={() => { setLabel(t.label); setAmount(t.amount.toString()); setEditingId(t.id); }} className="hover:text-white underline">Edit</button>
                          <button onClick={() => setTransactions(prev => prev.filter(item => item.id !== t.id))} className="hover:text-white underline">✕</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="p-12 text-center opacity-30 text-xs tracking-widest uppercase font-bold text-[#2D1B2D]">
        Avec Ma Finance &copy; 2026 — Sanctuary for Your Wealth
      </footer>
    </div>
  );
}