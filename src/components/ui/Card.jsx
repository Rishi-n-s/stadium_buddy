import React from 'react';

const Card = React.forwardRef(({ className = "", children, hoverable = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-surface-container rounded-2xl border border-outline-variant p-6 shadow-md ${hoverable ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-outline' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
