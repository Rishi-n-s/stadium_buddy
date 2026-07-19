import React from 'react';

const Input = React.forwardRef(({ className = "", icon: Icon, error, ...props }, ref) => {
  const inputId = props.id || React.useId();
  const errorId = `${inputId}-error`;

  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon aria-hidden="true" className="h-5 w-5 text-outline" />
        </div>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : undefined}
        className={`w-full bg-surface text-on-surface border rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 placeholder-outline-variant
          ${Icon ? 'pl-10 pr-4' : 'px-4'}
          ${error ? 'border-error focus:ring-error' : 'border-outline-variant'}
          ${className}
        `}
        {...props}
      />
      {error && <p id={errorId} role="alert" className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

import PropTypes from 'prop-types';

Input.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.elementType,
  error: PropTypes.string,
  id: PropTypes.string,
};

export default Input;
