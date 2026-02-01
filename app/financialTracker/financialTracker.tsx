"use client";

// Imported necessary libraries. 
//UseState helps for state management, useMemo for memoizing values, and useEffect for saving data, etc. 
import React, { useState, useMemo, useEffect } from 'react';

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
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col xl:flex-row gap-10 items-start justify-center">
      
      {/* CALENDAR-STYLE MONTH GRID */}
      <div className="w-full xl:w-72 shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2d1b2d]/40 mb-4 px-1">Select Month</p>
        <div className="grid grid-cols-3 gap-2">
          {months.map(m => (
            <button 
              key={m} 
              onClick={() => setActiveMonth(m)}
              className={`aspect-square flex items-center justify-center rounded-2xl text-[10px] font-bold transition-all border ${
                activeMonth === m 
                ? 'bg-[#2d1b2d] text-white border-[#2d1b2d] shadow-lg scale-105' 
                : 'bg-white text-[#2d1b2d]/60 border-[#eae2d6] hover:border-[#2d1b2d]/20'
              }`}
            >
              {m.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/*CENTER: MAIN TRACKER*/}
      <div className="flex-1 w-full max-w-2xl space-y-6 mx-auto">
        <div className="bg-[#eae2d6] p-12 rounded-[3.5rem] text-center shadow-sm border border-[#2d1b2d]/5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#2d1b2d]/50">Money Left • {activeMonth}</p>
          <h2 className={`text-6xl font-bold mt-2 tracking-tighter ${stats.safe < 0 ? 'text-[#c27664]' : 'text-[#2d1b2d]'}`}>
            ${stats.safe.toFixed(2)}
          </h2>
        </div>

        <div className={`bg-white p-6 rounded-[2rem] border-2 transition-all shadow-sm ${editingId ? 'border-[#9caf88]' : 'border-[#eae2d6]'}`}>
          <div className="flex gap-2 mb-4">
            <input className="flex-1 p-4 rounded-xl bg-[#f9f7f2] border border-[#eae2d6] outline-none text-sm" placeholder="Label" value={label} onChange={e => setLabel(e.target.value)} />
            <input className="w-28 p-4 rounded-xl bg-[#f9f7f2] border border-[#eae2d6] outline-none text-sm" type="number" placeholder="$" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => saveEntry('income')} className="bg-[#9caf88] text-white p-3 rounded-xl font-bold uppercase text-[10px]">Income</button>
            <button onClick={() => saveEntry('expense')} className="bg-[#d6a5a5] text-[#2d1b2d] p-3 rounded-xl font-bold uppercase text-[10px]">Expense</button>
            <button onClick={() => saveEntry('bill')} className="bg-[#2d1b2d] text-white p-3 rounded-xl font-bold uppercase text-[10px]">Bill</button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#2d1b2d]/60 px-2">Upcoming Bills</h3>
          {monthlyData.filter(t => t.type === 'bill').map(bill => (
            <div key={bill.id} className="flex justify-between items-center p-5 bg-white border border-[#eae2d6] rounded-2xl">
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
      <div className="w-full xl:w-80 shrink-0 bg-[#f9f7f2]/50 p-6 rounded-[2.5rem] border border-[#eae2d6] min-h-[500px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xs uppercase tracking-widest text-[#2d1b2d]">Activity</h3>
          {monthlyData.length > 0 && (
            <button 
              onClick={clearAllTransactions}
              className="text-[9px] font-bold uppercase text-[#c27664] hover:underline tracking-wider"
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
              <div key={t.id} className="p-4 bg-white rounded-2xl border border-[#eae2d6] text-xs">
                <div className="flex justify-between font-bold mb-1">
                  <span>{t.label}</span>
                  <span className={t.type === 'income' ? 'text-[#9caf88]' : 'text-[#c27664]'}>${t.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center opacity-50">
                  <span className="uppercase text-[8px] font-black">{t.type}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setLabel(t.label); setAmount(t.amount.toString()); setEditingId(t.id); }} className="text-[#9caf88] hover:underline">Edit</button>
                    <button onClick={() => setTransactions(prev => prev.filter(item => item.id !== t.id))} className="text-[#c27664] hover:underline">✕</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}