import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

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
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use gemini-2.5-flash (stable model, best price-performance)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "You are a supportive and friendly assistant. Be genuine, respectful, and treat users as capable adults. Keep responses concise and conversational - like chatting with a trusted friend who gets you. Be warm but not condescending. Use exclamation marks and emojis naturally to add warmth and friendliness to your responses! 😊 Feel free to use emojis like 😊, 💪, 🌟, ❤️, 🤗, ✨, 🎉, 💡, 🙌, and others when appropriate. Make your responses feel lively and engaging while still being helpful and practical. IMPORTANT: Focus on making supportive statements and offering helpful suggestions rather than asking lots of questions. Only ask questions when absolutely necessary to understand what the user needs. Prefer to provide affirmations, encouragement, and practical advice. Sound natural and conversational - like you're just chatting, not conducting an interview."
    });

    // Build conversation history for Gemini
    let chatHistory: any[] = [];
    if (history && Array.isArray(history) && history.length > 0) {
      // Filter out the welcome message and only include actual conversation
      const filteredHistory = history.filter((msg: { role: string; content: string }) => 
        !msg.content.includes("Welcome") && !msg.content.includes("village is here")
      );
      
      chatHistory = filteredHistory.map((msg: { role: string; content: string }) => ({
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
    const errorDetails = error?.cause || error?.stack || "";
    
    return NextResponse.json(
      { 
        error: "Failed to get response from AI",
        details: errorMessage,
        stack: errorDetails,
        message: `Error: ${errorMessage}. Please check your GEMINI_API_KEY in .env file and restart your dev server.`
      },
      { status: 500 }
    );
  }
}
