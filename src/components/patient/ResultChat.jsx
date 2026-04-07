import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Loader2, FlaskConical, ShieldAlert } from 'lucide-react';
import { chatWithResultApi } from '../../api/result.api';
import { format } from 'date-fns';

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
        className="w-2 h-2 rounded-full bg-primary-400/50 animate-bounce"
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
    <div className="flex flex-col bg-surface-900 h-[calc(100vh-3.5rem)] lg:h-screen">

      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-surface-600 bg-surface-800/80 backdrop-blur-xl">
        <Link
          to={`/patient/results/${result._id}`}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-surface-300 hover:text-surface-50 hover:bg-surface-700 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="w-8 h-8 rounded-xl bg-primary-400/10 border border-primary-400/20 flex items-center justify-center flex-shrink-0">
          <FlaskConical className="w-4 h-4 text-primary-400" strokeWidth={1.8} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-surface-50 truncate">{result.testName}</p>
          <p className="text-xs text-surface-300 font-mono">
            Collected {format(new Date(result.collectionDate), 'MMM d, yyyy')}
            {result.labName ? ` · ${result.labName}` : ''}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-full px-3 py-1 text-xs font-medium flex-shrink-0">
          <ShieldAlert className="w-3 h-3" />
          No medical advice
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-3 animate-fadeIn ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary-400/15 border border-primary-400/25 flex items-center justify-center flex-shrink-0 mb-0.5">
                <Bot className="w-4 h-4 text-primary-400" />
              </div>
            )}

            <div
              className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white font-medium rounded-br-sm'
                  : 'bg-surface-700 text-surface-50 border border-surface-600 rounded-bl-sm'
              }`}
            >
              <MessageText content={msg.content} />
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 mb-0.5">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-3 justify-start animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-primary-400/15 border border-primary-400/25 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-400" />
            </div>
            <div className="bg-surface-700 border border-surface-600 rounded-2xl rounded-bl-sm px-4 py-3">
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-surface-600 bg-surface-800/80 backdrop-blur-xl px-4 sm:px-8 py-4">
        {disabled && (
          <p className="text-xs text-amber-400 mb-3 flex items-center gap-1.5">
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
            className="flex-1 text-sm bg-surface-700 border border-surface-600 rounded-2xl px-5 py-3 text-surface-50 placeholder-surface-300
              focus:outline-none focus:border-primary-400/60 focus:shadow-input
              disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading || disabled}
            className="w-11 h-11 rounded-2xl bg-primary-600 flex items-center justify-center text-white hover:bg-primary-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-surface-300 mt-2 text-center">
          For medical advice, diagnoses, or medications — always speak with your doctor.
        </p>
      </div>
    </div>
  );
};

export default ResultChat;
