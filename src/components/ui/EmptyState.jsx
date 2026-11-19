import React from 'react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-surface/50 border border-border/60 ${className}`}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center text-muted mb-4 shadow-inner">
          <Icon className="w-7 h-7 text-accent" />
        </div>
      )}
      <h4 className="text-base font-bold text-white mb-1">
        {title}
      </h4>
      {description && (
        <p className="text-sm text-muted max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
