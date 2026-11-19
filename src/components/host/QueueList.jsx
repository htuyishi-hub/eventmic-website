import React from 'react';
import { Users } from 'lucide-react';
import { QueueItem } from './QueueItem.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';

export function QueueList({
  queue = [],
  onGrant,
  onDrop,
  onOpenQr
}) {
  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
      {/* Queue Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-surface/80 flex-shrink-0">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">
            Up Next
          </h2>
          <p className="text-xs text-muted">
            Democratic FIFO Queue
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-background border border-border text-accent">
          {queue.length} in line
        </span>
      </div>

      {/* Queue Items or Empty State */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {queue.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No hands raised yet"
            description="Share the QR code or link to let attendees raise their hands and take the floor."
            action={
              onOpenQr && (
                <button
                  onClick={onOpenQr}
                  className="text-xs text-accent hover:underline font-semibold"
                >
                  Show QR Code &rarr;
                </button>
              )
            }
            className="h-full border-none bg-transparent"
          />
        ) : (
          queue.map((item, index) => (
            <QueueItem
              key={item.id}
              item={item}
              index={index}
              onGrant={onGrant}
              onDrop={onDrop}
            />
          ))
        )}
      </div>
    </div>
  );
}
