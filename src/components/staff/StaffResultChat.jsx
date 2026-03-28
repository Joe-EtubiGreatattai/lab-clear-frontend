import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Loader2, FlaskConical, Info } from 'lucide-react';
import { staffChatWithResultApi } from '../../api/result.api';
import { format } from 'date-fns';

// Renders **bold**, *italic*, and newlines
const MessageText = ({ content }) => {
  const lines = content.split('\n').filter((l, i, arr) => !(l === '' && arr[i - 1] === ''));
  return (
    <span>
      {lines.map((line, li) => {
        const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
        return (
          <span key={li}>
            {parts.map((part, pi) => {
              if (part.startsWith('**') && part.endsWith('**'))
                return <strong key={pi}>{part.slice(2, -2)}</strong>;
              if (part.startsWith('*') && part.endsWith('*'))
                return <em key={pi}>{part.slice(1, -1)}</em>;
              return part;
            })}
            {li < lines.length - 1 && <br />}
          </span>
        );
      })}
    </span>
  );
};

const TypingDots = () => (
  <div className="flex items-center gap-1 px-1 py-0.5">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
      />
    ))}
  </div>
);

const WELCOME =
  "Hello. I'm your clinical lab assistant. Ask me anything about this patient's results — I can discuss clinical significance, flag patterns, reference ranges, or suggest relevant follow-up investigations. I support your analysis but all clinical decisions remain yours.";

const StaffResultChat = ({ result }) => {
  const [messages, setMessages] = useState(() => [
    { role: 'assistant', content: WELCOME },
    ...(result.staffChatHistory ?? []),
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const history = messages.slice(1);
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await staffChatWithResultApi(result._id, question, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setMessages((prev) => [...prev, { role: 'assistant', content: errMsg }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex flex-col bg-white" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ── Top bar ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-slate-100 bg-white">
        <Link
          to={`/staff/results/${result._id}`}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
          <FlaskConical className="w-4 h-4 text-teal-600" strokeWidth={1.8} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{result.testName}</p>
          <p className="text-xs text-slate-400">
            {result.patient
              ? `${result.patient.firstName} ${result.patient.lastName} · `
              : ''}
            Collected {format(new Date(result.collectionDate), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-3 py-1 text-xs font-medium flex-shrink-0">
          <Bot className="w-3 h-3" />
          Clinical AI
        </div>
      </div>

      {/* ── Disclaimer banner ── */}
      <div className="flex-shrink-0 flex items-start gap-2 bg-amber-50 border-b border-amber-100 px-4 sm:px-6 py-2.5">
        <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-snug">
          AI analysis is for reference only. It does not replace clinical judgement or constitute a diagnosis. All treatment decisions remain with the treating physician.
        </p>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 space-y-5">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-3 animate-fadeIn ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mb-0.5">
                <Bot className="w-4 h-4 text-teal-600" />
              </div>
            )}

            <div
              className={`max-w-[80%] sm:max-w-[65%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-teal-600 text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-700 rounded-bl-sm'
              }`}
            >
              <MessageText content={msg.content} />
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 mb-0.5">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-3 justify-start animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-teal-600" />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="flex-shrink-0 border-t border-slate-100 bg-white px-4 sm:px-8 py-4">
        <div className="flex gap-3 items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
            placeholder="Ask about clinical significance, differentials, follow-up tests…"
            className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent disabled:opacity-50 placeholder:text-slate-400"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-2xl bg-teal-600 flex items-center justify-center text-white hover:bg-teal-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffResultChat;
