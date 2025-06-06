import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  shadow = 'md', 
  hover = false,
  ...props 
}) => {
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };
  
  const hoverClass = hover ? 'transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg' : '';
  
  const classes = `bg-white dark:bg-gray-800 rounded-lg p-6 ${shadowClasses[shadow]} ${hoverClass} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;