"use client";

import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import { useSession } from "next-auth/react";
import { Plus, ShoppingBag, Wallet, Calendar, MessageCircle, Heart, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

// Calendar event types
type LoadLevel = "light" | "medium" | "heavy";
type CalendarEvent = {
  id: number;
  title: string;
  desc: string;
  date: string;
  time: string;
  load: LoadLevel;
  isAllDay: boolean;
  completed: boolean;
};

// Financial transaction types
type TransactionType = "income" | "expense" | "bill";
interface Transaction {
  id: number;
  label: string;
  amount: number;
  type: TransactionType;
  month: string;
  isPaid: boolean;
}

const CALENDAR_STORAGE_KEY = "avecma_calendar_events_v1";
const FINANCE_STORAGE_KEY = "avec-ma-finance-v4";

function safeLoadEvents(): CalendarEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeLoadTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FINANCE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const { data: session } = useSession();
  const [isHydrated, setIsHydrated] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  // Load data after hydration
  useEffect(() => {
    setIsHydrated(true);
    setEvents(safeLoadEvents());
    setTransactions(safeLoadTransactions());
  }, []);

  // Fetch AI analysis when data changes
  useEffect(() => {
    if (!isHydrated) return;
    
    const fetchAnalysis = async () => {
      setIsAnalyzing(true);
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            events,
            transactions,
            currentMonth,
          }),
        });
        const data = await response.json();
        if (data.analysis) {
          setAiAnalysis(data.analysis);
        }
      } catch (error) {
        console.error("Failed to get analysis:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    // Debounce analysis
    const timer = setTimeout(fetchAnalysis, 1000);
    return () => clearTimeout(timer);
  }, [events, transactions, isHydrated, currentMonth]);

  // Today's tasks
  const todayTasks = useMemo(() => {
    if (!isHydrated) return [];
    return events.filter((e) => e.date === todayStr && !e.completed);
  }, [events, todayStr, isHydrated]);

  // Top 3 Priorities
  const topPriorities = useMemo(() => {
    if (!isHydrated) return [];
    const incomplete = events.filter((e) => !e.completed);
    return incomplete
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [events, isHydrated]);

  // Capacity calculation - matching calendar page logic exactly
  const capacity = useMemo(() => {
    if (!isHydrated) return 0;
    const weights: Record<LoadLevel, number> = { light: 1, medium: 3, heavy: 5 };
    const active = events.filter((e) => !e.completed && e.date === todayStr);
    const totalWeight = active.reduce((acc, curr) => acc + (weights[curr.load] || 3), 0);
    return Math.min(Math.floor((totalWeight / 10) * 100), 100);
  }, [events, todayStr, isHydrated]);

  // Burnout risk
  const burnoutRisk = useMemo(() => {
    if (capacity === 0) return 0;
    return Math.min(100 - capacity + 20, 100);
  }, [capacity]);

  // Financial stats - matching financialTracker page calculation
  const financialStats = useMemo(() => {
    if (!isHydrated) return { income: 0, expenses: 0, bills: 0, paidBills: 0, safe: 0 };
    const monthlyData = transactions.filter((t) => t.month === currentMonth);
    const income = monthlyData.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const expenses = monthlyData.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    const bills = monthlyData.filter((t) => t.type === "bill").reduce((a, b) => a + b.amount, 0);
    const paidBills = monthlyData.filter((t) => t.type === "bill" && t.isPaid).reduce((a, b) => a + b.amount, 0);
    return {
      income,
      expenses,
      bills,
      paidBills,
      safe: income - expenses - paidBills, // Money left after expenses and paid bills
    };
  }, [transactions, currentMonth, isHydrated]);

  // Task completion stats - matching calendar page logic
  const taskStats = useMemo(() => {
    if (!isHydrated) return { completed: 0, total: 0, completionRate: 0 };
    const completed = events.filter((e) => e.completed).length;
    const total = events.length;
    return {
      completed,
      total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [events, isHydrated]);

  // Recent expenses for graph
  const recentExpenses = useMemo(() => {
    if (!isHydrated) return [];
    return transactions
      .filter((t) => t.type === "expense")
      .sort((a, b) => b.id - a.id)
      .slice(0, 7)
      .map((e) => e.amount);
  }, [transactions, isHydrated]);

  const maxExpense = Math.max(...recentExpenses, 1);

  // Calendar data
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const getDayEvents = (day: number) => {
    if (!isHydrated) return [];
    const dateString = new Date(year, month, day).toISOString().split("T")[0];
    return events.filter((e) => e.date === dateString);
  };

  const getSoftColor = (load: LoadLevel) => {
    if (load === "heavy") return "bg-[#FCA5A5]";
    if (load === "medium") return "bg-[#FDE68A]";
    return "bg-[#A7F3D0]";
  };

  const firstName = session?.user?.name?.split(" ")[0] || "Mama";
  const capacityLevel = capacity < 50 ? "LOW" : capacity < 80 ? "MEDIUM" : "HIGH";

  // Chart data for Oh-Crap Expenses
  const expenseChartData = recentExpenses.map((amount, index) => ({
    name: `Day ${index + 1}`,
    value: amount,
  }));

  // Calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getDayEvents(day);
    calendarDays.push({ day, events: dayEvents });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #f9f7f2 0%, #ece0da 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 4s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-8px);
        }
      `}</style>
      <Navbar />

      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-10 blur-3xl animate-float"
          style={{
            background: "#9caf88",
            animationDelay: "0s",
          }}
        />
        <div
          className="absolute bottom-20 left-20 w-80 h-80 rounded-full opacity-10 blur-3xl animate-float"
          style={{
            background: "#d6a5a5",
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full opacity-8 blur-3xl animate-pulse-slow"
          style={{
            background: "#c27664",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      <div className="flex-1 flex flex-col p-6 md:p-10 relative z-10 min-h-[calc(100vh-70px)] max-w-7xl mx-auto w-full">
        {/* Centered Logo Section */}
        <div className="flex flex-col items-center justify-center mb-12 mt-8 animate-fade-in-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
          {/* Large Circular Logo */}
          <div className="relative hover-lift mb-8">
            {/* Animated glow */}
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-30 animate-pulse-slow"
              style={{
                background: "radial-gradient(circle, #51295b 0%, transparent 70%)",
                transform: "scale(1.3)",
              }}
            />
            
            {/* Circular logo image */}
            <div
              className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #51295b 0%, #6b3a7a 100%)",
                boxShadow: "0 25px 80px rgba(81, 41, 91, 0.4)",
                border: "5px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 30px 100px rgba(81, 41, 91, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 25px 80px rgba(81, 41, 91, 0.4)";
              }}
            >
              <Image
                src="/logo.png"
                alt="Avec Ma Logo"
                width={384}
                height={384}
                className="w-full h-full object-cover"
                style={{
                  borderRadius: "50%",
                }}
              />
            </div>
          </div>
          
          {/* Brand Name */}
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-center mb-3"
            style={{
              fontFamily: "var(--font-dancing), cursive",
              color: "#51295b",
              letterSpacing: "0.02em",
              textShadow: "0 2px 20px rgba(81, 41, 91, 0.1)",
            }}
          >
            Avec Ma
          </h1>
          
          {/* Welcome Message */}
          {session && (
            <p className="text-lg md:text-xl text-[#6b3a7a] opacity-80">
              Welcome back, <span className="font-semibold text-[#51295b]">{firstName}</span>
            </p>
          )}
          
          {/* Tagline */}
          <p
            className="text-base md:text-lg text-center mt-2"
            style={{
              color: "#6b3a7a",
              opacity: 0.7,
              fontStyle: "italic",
            }}
          >
            Your mindful companion
          </p>
        </div>

        {/* Mini Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
          {/* Stats Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Today's Tasks Stat */}
            <Link href="/calendar" className="hover-lift block">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg transition-all duration-300 hover:bg-white/90 hover:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#51295b]/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#51295b]" />
                    </div>
                    <h3 className="font-semibold text-[#51295b]">Today's Tasks</h3>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#51295b] opacity-50" />
                </div>
                {isHydrated && todayTasks.length > 0 ? (
                  <>
                    <p className="text-4xl font-bold text-[#6b3a7a] mb-1">{todayTasks.length}</p>
                    <p className="text-sm text-[#6b3a7a] opacity-70">tasks remaining</p>
                  </>
                ) : (
                  <p className="text-lg text-[#6b3a7a] opacity-60">No tasks today</p>
                )}
              </div>
            </Link>

            {/* Financial Stat */}
            {isHydrated && financialStats.income > 0 && (
              <Link href="/finance" className="hover-lift block">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg transition-all duration-300 hover:bg-white/90 hover:shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#51295b]/10 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-[#51295b]" />
                      </div>
                      <h3 className="font-semibold text-[#51295b]">This Month</h3>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#51295b] opacity-50" />
                  </div>
                  <p className="text-4xl font-bold text-[#6b3a7a] mb-1">
                    ${financialStats.safe > 0 ? financialStats.safe.toLocaleString() : "0"}
                  </p>
                  <p className="text-sm text-[#6b3a7a] opacity-70">available</p>
                </div>
              </Link>
            )}

            {/* Completion Stat */}
            {isHydrated && taskStats.total > 0 && (
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#51295b]/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#51295b]" />
                  </div>
                  <h3 className="font-semibold text-[#51295b]">Completion</h3>
                </div>
                <p className="text-4xl font-bold text-[#6b3a7a] mb-1">{taskStats.completionRate}%</p>
                <p className="text-sm text-[#6b3a7a] opacity-70">tasks completed</p>
              </div>
            )}
          </div>

          {/* Quick Actions Column */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg mb-4">
              <h2 className="text-xl font-bold text-[#51295b] mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/calendar" className="hover-lift group">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/50 text-center transition-all duration-300 group-hover:bg-white/80 group-hover:shadow-md">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#51295b]/10 flex items-center justify-center group-hover:bg-[#51295b]/20 transition-colors">
                      <Calendar className="w-6 h-6 text-[#51295b]" />
                    </div>
                    <h3 className="font-semibold text-[#51295b] text-sm mb-1">Calendar</h3>
                    <p className="text-xs text-[#6b3a7a] opacity-70">Schedule</p>
                  </div>
                </Link>

                <Link href="/gemini" className="hover-lift group">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/50 text-center transition-all duration-300 group-hover:bg-white/80 group-hover:shadow-md">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#51295b]/10 flex items-center justify-center group-hover:bg-[#51295b]/20 transition-colors">
                      <MessageCircle className="w-6 h-6 text-[#51295b]" />
                    </div>
                    <h3 className="font-semibold text-[#51295b] text-sm mb-1">Chat</h3>
                    <p className="text-xs text-[#6b3a7a] opacity-70">Talk</p>
                  </div>
                </Link>

                <Link href="/mood" className="hover-lift group">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/50 text-center transition-all duration-300 group-hover:bg-white/80 group-hover:shadow-md">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#51295b]/10 flex items-center justify-center group-hover:bg-[#51295b]/20 transition-colors">
                      <Heart className="w-6 h-6 text-[#51295b]" />
                    </div>
                    <h3 className="font-semibold text-[#51295b] text-sm mb-1">Mood</h3>
                    <p className="text-xs text-[#6b3a7a] opacity-70">Feelings</p>
                  </div>
                </Link>

                <Link href="/finance" className="hover-lift group">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/50 text-center transition-all duration-300 group-hover:bg-white/80 group-hover:shadow-md">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#51295b]/10 flex items-center justify-center group-hover:bg-[#51295b]/20 transition-colors">
                      <Wallet className="w-6 h-6 text-[#51295b]" />
                    </div>
                    <h3 className="font-semibold text-[#51295b] text-sm mb-1">Finance</h3>
                    <p className="text-xs text-[#6b3a7a] opacity-70">Money</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Additional Dashboard Info */}
            {isHydrated && (todayTasks.length > 0 || topPriorities.length > 0) && (
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg">
                <h2 className="text-xl font-bold text-[#51295b] mb-4">Upcoming Priorities</h2>
                {topPriorities.length > 0 ? (
                  <div className="space-y-3">
                    {topPriorities.map((priority, idx) => (
                      <div key={priority.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[#51295b]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-[#51295b]">{idx + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#51295b] truncate">{priority.title}</p>
                          <p className="text-xs text-[#6b3a7a] opacity-70">
                            {new Date(priority.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#6b3a7a] opacity-60">No upcoming priorities</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
