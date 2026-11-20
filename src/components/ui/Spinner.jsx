import React from 'react';
import { DMMark } from '../brand/DMLogo.jsx';

export function Spinner({ size = 'md', className = '' }) {
  const pxMap = {
    sm: 20,
    md: 32,
    lg: 52
  };

  return (
    <span
      role="progressbar"
      aria-label="Loading"
      className={`inline-flex items-center justify-center text-foreground ${className}`}
    >
      <DMMark size={pxMap[size] || pxMap.md} loop />
    </span>
  );
}
