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
    
    // Use gemini-1.5-flash (available model)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
