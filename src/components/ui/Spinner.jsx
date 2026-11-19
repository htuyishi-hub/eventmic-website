import React from 'react';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3'
  };

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      className={`inline-block rounded-full border-t-accent border-r-accent/20 border-b-accent/20 border-l-accent/20 animate-spin ${sizes[size] || sizes.md} ${className}`}
    />
  );
}
