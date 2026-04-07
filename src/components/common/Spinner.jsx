import { FlaskConical } from 'lucide-react';

const Spinner = ({ size = 'md', fullPage = false, message = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-10 h-10 border-[3px]',
  };

  const ring = (
    <div className={`${sizes[size]} border-primary-400/20 border-t-primary-400 rounded-full animate-spin`} />
  );

  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-6">
        <div className="w-16 h-16 bg-primary-50 border border-primary-100 rounded-3xl flex items-center justify-center animate-glowPulse">
          <FlaskConical className="w-8 h-8 text-primary-500 animate-pulse2" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-surface-900">{message || 'Synchronizing Data'}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400 mt-1">Clinical Laboratory Network</p>
        </div>
      </div>
    );
  }

    return (
      <div className="flex items-center gap-3">
        <div className={`${sizes[size]} border-primary-400/10 border-t-primary-500 rounded-full animate-spin shadow-sm`} />
        <span className="text-xs font-bold uppercase tracking-widest text-surface-500">{message}</span>
      </div>
    );

  return ring;
};

export default Spinner;
