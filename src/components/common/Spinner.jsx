import { FlaskConical } from 'lucide-react';

const Spinner = ({ size = 'md', fullPage = false, message = '' }) => {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-7 h-7 border-2', lg: 'w-10 h-10 border-[3px]' };

  const ring = (
    <div className={`${sizes[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin`} />
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center">
          <FlaskConical className="w-8 h-8 text-primary-600 animate-pulse" />
        </div>
        {message && <p className="text-sm text-slate-500 font-medium">{message}</p>}
        {!message && <p className="text-sm text-slate-400">Loading…</p>}
      </div>
    );
  }

  if (message) {
    return (
      <div className="flex items-center gap-2.5">
        {ring}
        <span className="text-sm text-slate-500">{message}</span>
      </div>
    );
  }

  return ring;
};

export default Spinner;
