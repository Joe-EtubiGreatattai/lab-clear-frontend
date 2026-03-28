import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Loader2, FlaskConical, ShieldAlert } from 'lucide-react';
import { chatWithResultApi } from '../../api/result.api';
import { format } from 'date-fns';

// Renders **bold** and newlines in message text
const MessageText = ({ content }) => {
  const lines = content.split('\n').filter((l, i, arr) => !(l === '' && arr[i - 1] === ''));
  return (
    <span>
      {lines.map((line, li) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={li}>
            {parts.map((part, pi) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={pi}>{part.slice(2, -2)}</strong>
                : part
            )}
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

const ResultChat = ({ result }) => {
  const disabled = result.aiStatus !== 'done';

  const welcome = {
    role: 'assistant',
    content:
      "Hi! I'm here to help you understand your lab results in plain, everyday language. Feel free to ask me anything about what the numbers mean or what a test checks for. I can't recommend medications or give medical advice — for that, please speak with your doctor.",
  };

  const [messages, setMessages] = useState(() => [
    welcome,
    ...(result.chatHistory ?? []),
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
    if (!question || loading || disabled) return;

    // Skip the local welcome message (index 0) when building context for the API
    const history = messages.slice(1);
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await chatWithResultApi(result._id, question, history);
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col bg-white" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ── Top bar ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-slate-100 bg-white">
        <Link
          to={`/patient/results/${result._id}`}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <FlaskConical className="w-4 h-4 text-primary-600" strokeWidth={1.8} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{result.testName}</p>
          <p className="text-xs text-slate-400">
            Collected {format(new Date(result.collectionDate), 'MMM d, yyyy')}
            {result.labName ? ` · ${result.labName}` : ''}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-medium flex-shrink-0">
          <ShieldAlert className="w-3 h-3" />
          No medical advice
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-3 animate-fadeIn ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mb-0.5">
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
            )}

            <div
              className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-700 rounded-bl-sm'
              }`}
            >
              <MessageText content={msg.content} />
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mb-0.5">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-3 justify-start animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-indigo-600" />
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
        {disabled && (
          <p className="text-xs text-amber-600 mb-3 flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" />
            Waiting for your AI summary to finish before you can ask questions…
          </p>
        )}
        <div className="flex gap-3 items-end">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading || disabled}
            placeholder="Ask something about your results…"
            className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-400 resize-none"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading || disabled}
            className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 text-center">
          For medical advice, diagnoses, or medications — always speak with your doctor.
        </p>
      </div>
    </div>
  );
};

export default ResultChat;
