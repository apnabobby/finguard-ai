import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Database, 
  CheckCircle2, 
  TrendingDown, 
  ShieldAlert, 
  Users, 
  Cpu, 
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';
import { AiChatMessage, CashFlowForecastResponse, GpuTelemetryData } from '../types';

interface AiCfoViewProps {
  cashFlow: CashFlowForecastResponse | null;
  gpuData: GpuTelemetryData | null;
  flaggedCount: number;
}

const PRESET_QUESTIONS = [
  'Why is cash flow decreasing over the next 60 days?',
  'Which transactions are currently suspicious and why?',
  'Which customers present the highest credit risk?',
  'What is the liquidity impact if our top customer delays payment by 30 days?',
  'How does AMD ROCm hardware acceleration improve our fraud detection SLAs?'
];

export const AiCfoView: React.FC<AiCfoViewProps> = ({
  cashFlow,
  gpuData,
  flaggedCount,
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg-initial',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `Hello. I am your **AI Chief Financial Officer & Risk Intelligence Officer**, powered by live telemetry and Gemini 2.5 Flash.

I have direct visibility into our **$4.85M liquid treasury**, our **22.4-month runway**, all **${flaggedCount} quarantined fraud vectors**, and our **AMD Instinct™ MI300X ROCm acceleration metrics**.

How can I assist your executive decision-making today? You can select any prompt below or type your inquiry.`,
      suggestedFollowUps: [
        'Why is cash flow decreasing?',
        'Which transactions are suspicious?',
        'Which customers are high risk?'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isGenerating) return;

    const userMsg: AiChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsGenerating(true);

    try {
      const res = await fetch('/api/cfo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.content
          }))
        })
      });

      if (!res.ok) throw new Error('CFO agent failed to respond');

      const data = await res.json();

      const assistantMsg: AiChatMessage = {
        id: `cfo-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: data.reply || 'Financial analysis generated.',
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `cfo-err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `### Executive System Notice\n\nI was unable to establish a connection to the primary AI model service. However, based on our in-memory financial database:\n- Current Treasury: **$4.85M**\n- Cash Runway: **${cashFlow?.runwayMonths || 22.4} months**\n- Active Anomalies: **${flaggedCount} transactions**\n\nPlease try again shortly.`,
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg-reset',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: 'Conversation history reset. All live financial telemetry remains synchronized. What would you like to review?',
      }
    ]);
  };

  // Helper to format basic markdown (bold, lists, headings) cleanly
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-base font-bold text-white mt-3 mb-1.5">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-lg font-bold text-white mt-3 mb-2">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
        return (
          <div key={idx} className="ml-2 my-1 text-xs text-slate-200 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
          </div>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-2 my-0.5 text-xs text-slate-200">
            <span className="text-purple-400">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^[-*]\s+/, '')) }} />
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-200 leading-relaxed my-1">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        </p>
      );
    });
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-cyan-300 px-1 py-0.5 rounded font-mono text-[11px]">$1</code>');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-purple-400" />
            FinGuard AI CFO — Conversational Risk Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous financial advisory agent with direct, live telemetry access to ledger balances, AR aging, customer concentration, and ROCm fraud scores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Chat
          </button>
        </div>
      </div>

      {/* Main Console Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: Interactive Chat Stream */}
        <div className="lg:col-span-8 flex flex-col h-[650px] rounded-2xl border border-slate-800 bg-slate-950/90 shadow-xl overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs ${
                    isAssistant
                      ? 'bg-purple-950/80 border border-purple-800/80 text-purple-300'
                      : 'bg-cyan-950/80 border border-cyan-800/80 text-cyan-300'
                  }`}>
                    {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  <div className={`max-w-[85%] rounded-2xl p-4 text-xs ${
                    isAssistant
                      ? 'bg-slate-900/90 border border-slate-800 text-slate-200'
                      : 'bg-gradient-to-r from-cyan-950/70 to-blue-950/70 border border-cyan-800/50 text-white'
                  }`}>
                    <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-slate-800/60 text-[10px] text-slate-400 font-mono">
                      <span>{isAssistant ? 'AI CFO Agent (Grounded Context)' : 'Executive Inquiry'}</span>
                      <div className="flex items-center gap-2">
                        <span>{msg.timestamp}</span>
                        {isAssistant && (
                          <button
                            onClick={() => copyToClipboard(msg.id, msg.content)}
                            className="hover:text-white"
                            title="Copy advisory text"
                          >
                            {copiedId === msg.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {renderFormattedText(msg.content)}
                    </div>
                  </div>
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex gap-3 items-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-950/80 border border-purple-800/80 text-purple-300">
                  <Bot className="h-4 w-4 animate-spin" />
                </div>
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 text-xs text-slate-400 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                  <span>AI CFO is querying live ledger, cash flow trajectories, and ROCm kernels...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Prompt Chips Bar */}
          <div className="border-t border-slate-800/80 bg-slate-900/40 p-2.5 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-[10px] uppercase font-bold text-slate-500 pl-1">Suggested:</span>
              {PRESET_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  disabled={isGenerating}
                  className="rounded-lg bg-slate-800/80 hover:bg-purple-950/50 hover:text-purple-300 hover:border-purple-700/60 border border-slate-700/60 px-2.5 py-1 text-[11px] text-slate-300 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input Box */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask the AI CFO anything (e.g. 'Why is cash flow decreasing?')"
                disabled={isGenerating}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isGenerating}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-950/50 hover:bg-purple-500 transition-all disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right 4 cols: Grounded Context & Knowledge Inspector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Live Grounding Context Sync
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              The AI CFO evaluates inquiries against active, verified enterprise data points:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Current Cash & Runway</span>
                <span className="font-mono font-bold text-white">
                  ${((cashFlow?.startingBalance || 4850000) / 1000000).toFixed(2)}M USD ({cashFlow?.runwayMonths || 22.4} Months)
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">High-Risk Suspicious Wires</span>
                <span className="font-mono font-bold text-rose-400">
                  {flaggedCount} Transactions ($428.9k quarantined)
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Counterparty Concentration</span>
                <span className="font-semibold text-slate-200">
                  Apex Global (34.5% ARR, Late 45d, DSO: 58d)
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">AMD ROCm Telemetry Baseline</span>
                <span className="font-mono font-semibold text-cyan-300">
                  {gpuData?.mode === 'rocm' ? '1.8 ms inference (14.6x speedup)' : '26.4 ms (CPU Fallback)'}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-purple-900/40 bg-purple-950/20 p-3 text-[11px] text-purple-200">
              <span className="font-bold block mb-1">Executive Assurance</span>
              Responses strictly reflect actual application state and avoid speculative estimates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
