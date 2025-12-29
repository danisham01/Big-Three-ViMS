
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Spinner } from './GlassComponents';
import { Bot, X, Send, User, MessageSquare, Sparkles, ChevronDown } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m your ViMS Smart Assistant. How can I help you today? You can ask me about registration steps, QR access types, or security protocols.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })), { role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: `You are the "ViMS Smart Assistant", an expert on the Visitor Management System.
          APP CONTEXT:
          - Flow 1 (Ad-hoc): For walk-ins. Requires Name, Phone (Required), Email (Optional), IC/ID Number, and IC Photo.
          - Flow 2 (Pre-registered): For guests with an invite. Requires a 5-digit unique code.
          - Transport: Car (needs license plate, uses LPR - License Plate Recognition) vs Walk-in/Bike (needs QR).
          - Access Points: "Main Entrance" (Front Gate) and "Service Lift" (Elevator).
          - QR Color Coding:
            * QR1 (Blue): Ad-hoc Pedestrian - Front Gate only.
            * QR2 (Orange): Pre-reg Car - Elevator only (LPR used for Gate).
            * QR3 (Green): Pre-reg Pedestrian - Gate + Elevator.
          - Roles: Staff (invite guests), Operator/Admin (approve/reject), Guard (scan & verify).
          - Tone: Professional, helpful, concise. Use bullet points for steps.`,
          temperature: 0.7,
        },
      });

      const botResponse = response.text || "I'm sorry, I'm having trouble connecting to my brain right now.";
      setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    "How to register as a guest?",
    "What is an access code?",
    "QR code colors explained",
    "How to login as staff?"
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 right-6 z-[90] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-90 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-blue-600'
        }`}
      >
        <div className="absolute inset-0 rounded-full bg-inherit animate-ping opacity-20"></div>
        {isOpen ? <X className="text-white" size={24} /> : <Bot className="text-white" size={24} />}
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-40 right-4 left-4 md:left-auto md:w-96 z-[100] transition-all duration-500 ease-out transform ${
        isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90 pointer-events-none'
      }`}>
        {/* Replaced GlassCard with a custom div to ensure flex-1 scrolling works correctly */}
        <div className="h-[550px] flex flex-col bg-white/95 dark:bg-[#121217]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden relative transition-colors">
          
          {/* Subtle Glows */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center justify-between shrink-0 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Smart Assistant</h3>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-slate-500 dark:text-white/40 font-bold uppercase tracking-widest">Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 dark:text-white/20 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Messages Container - flex-1 and overflow-y-auto only work if parent is flex col and has height */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar relative z-10"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/10' 
                  : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white/80 border border-slate-200 dark:border-white/5 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl rounded-tl-none p-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            {/* Invisible div to help with scroll anchoring */}
            <div className="h-2 w-full" />
          </div>

          {/* Bottom Area (Quick Actions + Input) */}
          <div className="shrink-0 relative z-10">
            {messages.length < 5 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto no-scrollbar">
                {quickActions.map(action => (
                  <button 
                    key={action}
                    onClick={() => { setInput(action); }}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/10 border border-blue-200 dark:border-blue-400/20 px-3 py-1.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-400/20 transition-all whitespace-nowrap"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/5">
              <div className="flex gap-2 relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white disabled:opacity-50 transition-all hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[8px] text-center text-slate-400 dark:text-white/20 mt-3 uppercase tracking-widest font-bold">
                Powered by Gemini AI Engine
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
