import React from 'react';

const variants = {
  success: 'bg-secondary-fixed-dim text-on-secondary-fixed',
  warning: 'bg-tertiary-container text-on-tertiary-container',
  error: 'bg-error text-on-error',
  info: 'bg-primary-container text-on-primary-container',
  neutral: 'bg-surface-variant text-on-surface-variant',
};

const Badge = React.forwardRef(({ className = "", variant = "neutral", children, ...props }, ref) => {
  const variantClasses = variants[variant] || variants.neutral;
  return (
    <span
      ref={ref}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-label-caps tracking-wider uppercase ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

import PropTypes from 'prop-types';

Badge.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info', 'neutral']),
  children: PropTypes.node,
};

export default Badge;
