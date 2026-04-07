const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center animate-fadeIn max-w-sm mx-auto">
    <div className="w-24 h-24 bg-primary-50 border border-primary-100 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm">
      {Icon && <Icon className="w-12 h-12 text-primary-500 animate-glowPulse" strokeWidth={1} />}
    </div>
    <h3 className="font-heading font-bold text-3xl tracking-tighter text-surface-900 mb-3">{title}</h3>
    <p className="text-sm font-medium text-surface-600 leading-relaxed text-balance">
      {description}
    </p>
    {action && (
      <div className="mt-10">
        {action}
      </div>
    )}
  </div>
);

export default EmptyState;
