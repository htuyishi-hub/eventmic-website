import React from 'react';

/**
 * Reusable Button component with accessible states, sizes, and variants.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all select-none rounded-xl active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-accent',
    live: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-live',
    secondary: 'bg-surface hover:bg-surface-hover text-foreground border border-border focus-visible:outline-border',
    warning: 'bg-warning text-black hover:bg-amber-400 focus-visible:outline-warning',
    ghost: 'bg-transparent hover:bg-surface text-muted hover:text-foreground focus-visible:outline-border',
    outline: 'bg-transparent border-2 border-accent text-accent hover:bg-accent/10 focus-visible:outline-accent'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 min-h-[44px]',
    md: 'text-sm px-4 py-2.5 min-h-[44px]',
    lg: 'text-base px-6 py-3.5 min-h-[48px]',
    huge: 'text-lg px-8 py-4 min-h-[56px] w-full' // 56px touch target for mobile attendee
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : children}
    </button>
  );
}
