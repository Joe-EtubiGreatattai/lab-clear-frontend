const PageWrapper = ({ children, title, subtitle, action, maxWidth = 'widescreen', padding = true }) => {
  const widths = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'widescreen': 'max-w-[1720px]',
    'full': 'max-w-full',
  };

  return (
    <div className={`${widths[maxWidth]} mx-auto ${padding ? 'px-6 lg:px-12 py-10 sm:py-14' : ''} w-full transition-all duration-500`}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-20 animate-fadeIn">
          <div className="min-w-0">
            {title && (
              <h1 className="font-heading text-4xl sm:text-5xl font-bold text-surface-900 tracking-tighter leading-tight text-balance">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base text-surface-500 mt-4 leading-relaxed max-w-2xl font-medium">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0 flex gap-3">{action}</div>}
        </div>
      )}
      <div className="animate-fadeIn stagger-2">
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
