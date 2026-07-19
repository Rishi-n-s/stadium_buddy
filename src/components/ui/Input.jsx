import React from 'react';

const Input = React.forwardRef(({ className = "", icon: Icon, error, ...props }, ref) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-outline" />
        </div>
      )}
      <input
        ref={ref}
        className={`w-full bg-surface text-on-surface border rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 placeholder-outline-variant
          ${Icon ? 'pl-10 pr-4' : 'px-4'}
          ${error ? 'border-error focus:ring-error' : 'border-outline-variant'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
