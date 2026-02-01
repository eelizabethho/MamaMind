import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { events, transactions, currentMonth } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Calculate stats
    const todayStr = new Date().toISOString().split("T")[0];
    const completedTasks = events.filter((e: any) => e.completed).length;
    const totalTasks = events.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const todayTasks = events.filter((e: any) => e.date === todayStr && !e.completed);
    const upcomingTasks = events.filter((e: any) => !e.completed && new Date(e.date) > new Date(todayStr)).length;
    
    const monthlyData = transactions.filter((t: any) => t.month === currentMonth);
    const income = monthlyData.filter((t: any) => t.type === "income").reduce((a: number, b: any) => a + b.amount, 0);
    const expenses = monthlyData.filter((t: any) => t.type === "expense").reduce((a: number, b: any) => a + b.amount, 0);
    const bills = monthlyData.filter((t: any) => t.type === "bill").reduce((a: number, b: any) => a + b.amount, 0);
    const paidBills = monthlyData.filter((t: any) => t.type === "bill" && t.isPaid).reduce((a: number, b: any) => a + b.amount, 0);
    
    // Calculate capacity
    const weights: Record<string, number> = { light: 1, medium: 3, heavy: 5 };
    const activeToday = events.filter((e: any) => !e.completed && e.date === todayStr);
    const totalWeight = activeToday.reduce((acc: number, curr: any) => acc + (weights[curr.load] || 3), 0);
    const capacity = Math.min(Math.floor((totalWeight / 10) * 100), 100);

    const systemInstruction = `You are a supportive wellness coach analyzing a user's performance data. Provide a brief, encouraging analysis (2-3 sentences max) based on their data. Be warm, specific, and actionable. Use emojis naturally. Focus on what they're doing well and offer one gentle suggestion.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction
    });

    const prompt = `Analyze this user's performance data and provide a brief, encouraging insight:

Task Completion: ${completionRate}% (${completedTasks} of ${totalTasks} tasks completed)
Today's Tasks: ${todayTasks.length} remaining
Upcoming Tasks: ${upcomingTasks} scheduled
Today's Capacity: ${capacity}% (${capacity < 50 ? "LOW" : capacity < 80 ? "MEDIUM" : "HIGH"})
Financial Status: $${income.toFixed(2)} income, $${expenses.toFixed(2)} expenses, $${bills.toFixed(2)} bills (${paidBills > 0 ? `$${paidBills.toFixed(2)} paid` : "none paid"})
Remaining Budget: $${(income - expenses - paidBills).toFixed(2)}

Provide a warm, brief analysis focusing on their strengths and one helpful suggestion.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ 
      analysis: text,
      stats: {
        completionRate,
        todayTasks: todayTasks.length,
        upcomingTasks,
        capacity,
        financialSafe: income - expenses - paidBills,
      }
    });
  } catch (error: any) {
    console.error("Error analyzing data:", error);
    return NextResponse.json(
      { error: "Failed to analyze data", analysis: "Keep up the great work! 🌟" },
      { status: 500 }
    );
  }
}
