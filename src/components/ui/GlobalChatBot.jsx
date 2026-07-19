import React, { useState, useRef, useEffect } from "react";
import { queryCopilot, OPERATIONAL_KNOWLEDGE } from "../../services/copilotEngine";
import Button from "./Button";

const GlobalChatBot = React.memo(function GlobalChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "ai", text: "StadiumIQ Assistant online. How can I help you today?" }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Basic sanitization
    const sanitizedInput = input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    const userMessage = { sender: "user", text: sanitizedInput };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Process using simulated RAG Engine
    const result = queryCopilot(userMessage.text);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: "ai",
        text: result.answer,
        citations: result.citations
      }]);
    }, 600); // Simulate network delay
  };

  return (
    <>
      {/* Floating Action Button */}
      <div 
        className={`fixed bottom-[140px] md:bottom-6 right-4 md:right-6 z-[9999] transition-transform duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <button 
          onClick={() => setIsOpen(true)}
          aria-label="Open Assistant Chatbot"
          aria-expanded={isOpen}
          className="w-14 h-14 md:w-16 md:h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-primary/50 hover:scale-105 transition-transform group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
          <span aria-hidden="true" className="material-symbols-outlined text-2xl md:text-3xl group-hover:rotate-12 transition-transform">smart_toy</span>
        </button>
      </div>

      {/* Chat Window */}
      <div 
        role="dialog"
        aria-label="Assistant Chat Window"
        className={`fixed bottom-[140px] md:bottom-6 right-4 md:right-6 w-[calc(100vw-32px)] md:w-[400px] h-[550px] max-h-[calc(100vh-160px)] md:max-h-[85vh] z-[9999] glass-overlay mechanical-border rounded-2xl flex flex-col shadow-2xl transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-surface-container-highest/80 backdrop-blur-md px-4 py-3 border-b border-outline-variant/30 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-primary">smart_toy</span>
            <span className="text-label-caps font-label-caps font-bold tracking-widest text-on-surface">STADIUMIQ ASSISTANT</span>
          </div>
          <button onClick={() => setIsOpen(false)} aria-label="Close Assistant" className="text-on-surface-variant hover:text-white transition-colors">
            <span aria-hidden="true" className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-black/40" role="log" aria-live="polite">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-3 max-w-[85%] rounded-xl ${
                msg.sender === "user" 
                  ? "bg-primary text-white rounded-br-sm" 
                  : "bg-surface-container-high text-on-surface border border-outline-variant/50 rounded-bl-sm"
              }`}>
                <p className="text-body-md whitespace-pre-wrap">{msg.text}</p>
                
                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {msg.citations.map((cite) => (
                      <span 
                        key={cite} 
                        className="font-mono text-[10px] bg-black/50 text-secondary-fixed px-2 py-1 rounded font-bold border border-secondary-fixed/30"
                        title={OPERATIONAL_KNOWLEDGE?.find(k => k.id === cite)?.content || ""}
                      >
                        [{cite}]
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface-container-highest/80 backdrop-blur-md rounded-b-2xl border-t border-outline-variant/30 flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask anything..."
            aria-label="Type your message"
            className="flex-grow bg-black/50 border border-outline-variant p-3 rounded-lg text-body-md focus:outline-none focus:border-primary transition-colors text-on-surface"
          />
          <Button 
            onClick={handleSend}
            aria-label="Send message"
            className="bg-primary text-white w-12 rounded-lg tactile-button flex items-center justify-center hover:bg-primary/80 transition-colors"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-xl">send</span>
          </Button>
        </div>
      </div>
    </>
  );
});

export default GlobalChatBot;
