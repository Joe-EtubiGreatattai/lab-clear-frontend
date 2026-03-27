const PageWrapper = ({ children, title, subtitle, action }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
    {(title || action) && (
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="animate-fadeIn">
          {title && (
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed max-w-xl">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    )}
    {children}
  </div>
);

export default PageWrapper;
