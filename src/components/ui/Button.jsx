import React from 'react';

const Button = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
