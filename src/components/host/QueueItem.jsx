import React, { useState, useEffect } from 'react';
import { Mic, X } from 'lucide-react';
import { formatWait } from '../../lib/time.js';
import { Button } from '../ui/Button.jsx';

export function QueueItem({
  item,
  index,
  onGrant,
  onDrop
}) {
  const [waitText, setWaitText] = useState(() => formatWait(item.raisedAt));
  const isFirst = index === 0;

  // Live updating wait timer every second
  useEffect(() => {
    const update = () => setWaitText(formatWait(item.raisedAt));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [item.raisedAt]);

  return (
    <div
      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
        isFirst
          ? 'bg-surface border-accent/60 shadow-md shadow-accent/10'
          : 'bg-surface/70 border-border hover:border-border/80'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Position Number */}
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 ${
            isFirst ? 'bg-accent text-white' : 'bg-background text-muted border border-border'
          }`}
        >
          {index + 1}
        </div>

        {/* Name and Wait Time */}
        <div className="min-w-0">
          <div className="text-sm font-bold text-white truncate">
            {item.name}
          </div>
          <div className="text-xs text-muted font-mono mt-0.5">
            {waitText}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        <Button
          variant={isFirst ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onGrant(item.id)}
          className="gap-1.5 text-xs py-1"
          aria-label={`Grant floor to ${item.name}`}
        >
          <Mic size={14} />
          <span>Grant</span>
        </Button>

        <button
          onClick={() => onDrop(item.id)}
          aria-label={`Remove ${item.name} from queue`}
          title="Remove from queue"
          className="p-1.5 rounded-lg text-muted hover:text-live hover:bg-live/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
