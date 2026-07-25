import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Send, Sparkles, User, ShieldAlert, Radio, HelpCircle, ArrowDown } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useSuraagStore } from '../store/useSuraagStore';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const AIAssistant: React.FC = () => {
  const { selectedCaseId, chatHistory, addChatMessage, clearChatHistory } = useSuraagStore();
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    if (!chatContainerRef.current) return;
    const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto';
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior,
    });
    setIsUserScrolledUp(false);
    setShowScrollButton(false);
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isUp = distanceFromBottom > 60;
    setIsUserScrolledUp(isUp);
    setShowScrollButton(isUp);
  };

  useEffect(() => {
    if (!isUserScrolledUp) {
      scrollToBottom(true);
      const timer1 = setTimeout(() => scrollToBottom(true), 50);
      const timer2 = setTimeout(() => scrollToBottom(true), 250);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [chatHistory, isThinking, isUserScrolledUp]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isThinking) return;

    if (!textToSend) setInputMessage('');
    addChatMessage({ role: 'user', text });
    setIsThinking(true);
    setIsUserScrolledUp(false);
    scrollToBottom(true);

    try {
      const activeCase = selectedCaseId || 'CASE-2026-DT01';
      const res = await apiClient.ai.chat(text, activeCase, chatHistory);
      addChatMessage({
        role: 'model',
        text: res.text,
        confidence: res.confidence || 96.8,
      });
    } catch (err: any) {
      addChatMessage({
        role: 'model',
        text: `**SYSTEM WARNING**: AI Reasoning Core encountered a communication error.\n\n*Details*: ${err?.message || 'Unable to connect to Suraag Backend API'}. Please ensure backend server is running and try again.`,
        confidence: 0,
      });
    } finally {
      setIsThinking(false);
      if (!isUserScrolledUp) {
        setTimeout(() => scrollToBottom(true), 50);
        setTimeout(() => scrollToBottom(true), 250);
      }
    }
  };

  const presetQueries = [
    'Explain the ballistic trajectory calculation and entry angle for Lohegaon Hill.',
    'Why was Diya Gupta flagged for critical contradictions regarding the cliff fall?',
    'What is the risk score and evidence link for Chetany Sharma?',
    'Recommend top search sector for missing CCTV buffer in Sector B-4.',
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-tactical-data uppercase text-primary font-bold tracking-widest">
              SURAAG BOT
            </span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold uppercase tracking-tight text-on-surface">
            AI Investigative Co-Pilot Assistant
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="confidence" pulse>SURAAG AI ONLINE</Badge>
          <button
            onClick={clearChatHistory}
            className="px-3 py-1 rounded bg-surface-container hover:bg-secondary-container text-on-surface-variant hover:text-primary transition-all font-tactical-data text-xs border border-outline-variant/50"
          >
            Clear Chat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Preset Queries */}
        <GlassCard className="p-5 space-y-4 h-fit border-outline-variant/60">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30 font-tactical-data text-xs text-primary font-bold">
            <HelpCircle className="w-4 h-4" />
            <span>INSTANT DIAGNOSTIC QUERIES</span>
          </div>
          <div className="space-y-2">
            {presetQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isThinking}
                className="w-full text-left p-3 rounded bg-surface-container-low hover:bg-secondary-container/60 hover:border-primary text-xs font-body-md text-on-surface-variant hover:text-on-surface border border-outline-variant/40 transition-all leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
              >
                "{q}"
              </button>
            ))}
          </div>
          <div className="pt-3 border-t border-outline-variant/30 font-tactical-data text-[11px] text-on-surface-variant/80">
            <span>● Context Synced: <strong>{selectedCaseId || 'CASE-2026-DT01'}</strong></span>
          </div>
        </GlassCard>

        {/* Right 3 Columns: Chat Box & Input */}
        <GlassCard className="lg:col-span-3 p-5 flex flex-col h-[600px] border-primary/50 shadow-[0_0_25px_rgba(255,84,76,0.2)] relative">
          {/* Chat Messages Stream */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 pr-2"
          >
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded bg-secondary-container border border-primary/60 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_10px_rgba(255,84,76,0.3)]">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                )}

                <div
                  className={`max-w-2xl p-4 rounded-lg font-body-md text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-on-primary font-semibold shadow-[0_0_15px_rgba(255,84,76,0.3)] rounded-br-none'
                      : 'bg-surface-container-high border border-outline-variant/50 text-on-surface rounded-bl-none'
                  }`}
                >
                  {msg.role === 'model' && (
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/30 font-tactical-data text-xs">
                      <span className="text-primary font-bold">SURAAG AI REASONING CORE</span>
                      {msg.confidence !== undefined && msg.confidence > 0 && (
                        <Badge variant="active" className="text-[10px]">
                          {msg.confidence}% CONFIDENCE
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-on-surface prose-strong:text-on-surface prose-pre:bg-surface-variant prose-pre:border prose-pre:border-outline-variant text-on-surface">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded bg-surface-variant border border-outline-variant flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-on-surface" />
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded bg-secondary-container border border-primary/60 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary animate-spin" />
                </div>
                <div className="p-4 rounded-lg bg-surface-container-high border border-outline-variant/50 text-on-surface font-tactical-data text-xs flex items-center gap-2 animate-pulse">
                  <Radio className="w-4 h-4 text-primary animate-ping" />
                  <span>SYNTHESIZING GEOMETRIC & BALLISTIC REASONING VECTORS...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <button
              onClick={() => scrollToBottom(true)}
              className="absolute bottom-20 right-8 p-2 rounded-full bg-primary text-on-primary shadow-lg border border-outline-variant/60 hover:bg-surface-tint transition-all animate-bounce z-10 flex items-center gap-1 text-xs font-tactical-data px-3"
            >
              <ArrowDown className="w-4 h-4" />
              <span>Latest</span>
            </button>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="shrink-0 mt-4 pt-4 border-t border-outline-variant/40 flex items-center gap-3"
          >
            <input
              type="text"
              placeholder={`Ask Suraag Bot anything regarding ${selectedCaseId || 'CASE-2026-DT01'} entities, math, or contradictions...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isThinking}
              className="flex-1 h-11 bg-surface-container-low text-xs font-tactical-data text-on-surface rounded border border-outline-variant px-4 focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/60 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isThinking || !inputMessage.trim()}
              className="px-6 h-11 rounded bg-primary text-on-primary font-tactical-data text-xs font-bold uppercase tracking-wider hover:bg-surface-tint disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,84,76,0.35)]"
            >
              <span>Transmit</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
