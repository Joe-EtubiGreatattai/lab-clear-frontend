const PageWrapper = ({ children, title, subtitle, action }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
    {(title || action) && (
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="min-w-0 animate-fadeIn">
          {title && (
            <h1 className="font-heading text-xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed max-w-xl hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    )}
    {children}
  </div>
);

export default PageWrapper;
