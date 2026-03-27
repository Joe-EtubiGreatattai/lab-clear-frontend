const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fadeIn">
    <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mb-5 shadow-sm">
      {Icon && <Icon className="w-10 h-10 text-primary-500" strokeWidth={1.5} />}
    </div>
    <h3 className="font-heading font-bold text-lg text-slate-800 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 max-w-xs leading-relaxed text-balance">{description}</p>
    {action && (
      <button onClick={action.onClick} className="btn-primary mt-6">
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
