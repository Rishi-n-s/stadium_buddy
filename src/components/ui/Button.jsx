import React from 'react';

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary-fixed hover:shadow-lg hover:shadow-primary/20',
  secondary: 'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed hover:shadow-lg hover:shadow-secondary-container/20',
  outline: 'border border-outline text-on-surface hover:border-primary hover:text-primary',
  ghost: 'text-on-surface hover:bg-surface-variant',
  danger: 'bg-error text-on-error hover:bg-error-container hover:text-on-error-container',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-3 text-lg font-semibold',
};

const Button = React.forwardRef(({ className = "", variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;
  
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses} ${sizeClasses} ${className}`}
      disabled={isLoading || props.disabled}
      aria-disabled={isLoading || props.disabled ? "true" : undefined}
      aria-busy={isLoading ? "true" : undefined}
      {...props}
    >
      {isLoading ? (
        <svg aria-hidden="true" className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

import PropTypes from 'prop-types';

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.node,
};

export default Button;
