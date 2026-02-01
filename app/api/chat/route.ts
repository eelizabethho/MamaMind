import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, history, therapist } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "Gemini API key not configured. Please set GEMINI_API_KEY in .env file and restart the server." },
        { status: 500 }
      );
    }

    console.log("API Key exists:", !!apiKey);
    console.log("Message received:", message);
    console.log("Therapist selected:", therapist?.name || "None");
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use therapist personality if selected, otherwise use default
    const systemInstruction = therapist?.personality 
      ? `${therapist.personality} Be conversational and natural - like texting a friend! Keep responses SHORT (1-3 sentences max). Use emojis naturally! 😊`
      : "You are a supportive and friendly assistant. Be conversational and natural - like texting a friend! Keep responses SHORT (1-3 sentences max). Give helpful advice when appropriate, and ask engaging questions to make users feel welcome and involved. Use emojis naturally! 😊 Be warm, genuine, and make people feel heard. Ask thoughtful questions that show you care and want to understand them better. Balance giving advice with asking questions - make it feel like a real conversation where both people are engaged. Sound natural and friendly, not robotic or formal.";
    
    // Use gemini-2.5-flash (stable model, best price-performance)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction
    });

    // Build conversation history for Gemini
    let chatHistory: any[] = [];
    if (history && Array.isArray(history) && history.length > 0) {
      // Filter out welcome/initial assistant messages
      const filteredHistory = history.filter((msg: { role: string; content: string }) => 
        msg.role === "user" || 
        (msg.role === "assistant" && 
         !msg.content.includes("Welcome") && 
         !msg.content.includes("village is here") &&
         !msg.content.includes("I'm here to support you"))
      );
      
      // Find first user message and start history from there
      let startIndex = 0;
      for (let i = 0; i < filteredHistory.length; i++) {
        if (filteredHistory[i].role === "user") {
          startIndex = i;
          break;
        }
      }
      
      // Build history starting from first user message
      const validHistory = filteredHistory.slice(startIndex);
      
      chatHistory = validHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));
    }

    // Start chat with history (or without if empty)
    const chat = model.startChat({
      history: chatHistory.length > 0 ? chatHistory : undefined,
    });

    // Send message
    console.log("Sending message to Gemini...");
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    console.log("Got response from Gemini");

    return NextResponse.json({ message: text });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    const errorMessage = error?.message || error?.toString() || "Unknown error occurred";
    
    // Check for quota/rate limit errors
    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("rate limit") || errorMessage.includes("Too Many Requests")) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded",
          details: errorMessage,
          message: "You've reached the daily API limit (20 requests/day on free tier). The limit resets daily. You can:\n\n• Wait for the quota to reset (usually at midnight PST)\n• Upgrade your Google AI Studio plan for higher limits\n• Try again later\n\nSorry for the inconvenience! 😊"
        },
        { status: 429 }
      );
    }
    
    // Check for API key errors
    if (errorMessage.includes("API key") || errorMessage.includes("401") || errorMessage.includes("403")) {
      return NextResponse.json(
        { 
          error: "API key error",
          details: errorMessage,
          message: "There's an issue with your API key. Please check your GEMINI_API_KEY in .env file and restart your dev server."
        },
        { status: 401 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { 
        error: "Failed to get response from AI",
        details: errorMessage,
        message: `Sorry, I encountered an error: ${errorMessage}. Please try again later.`
      },
      { status: 500 }
    );
  }
}
