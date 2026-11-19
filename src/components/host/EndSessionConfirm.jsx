import React from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';

export function EndSessionConfirm({
  isOpen,
  onClose,
  onConfirm,
  sessionName
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="End Live Session"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4 p-4 rounded-xl bg-live/10 border border-live/30 text-live">
          <AlertTriangle size={24} className="flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <strong className="font-bold text-sm block">Are you sure?</strong>
            <span>
              Ending <strong className="text-white">{sessionName}</strong> will disconnect all audience microphones and clear the queue. Attendees will see the session ended screen.
            </span>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="live"
            size="md"
            onClick={onConfirm}
            className="gap-2"
          >
            <LogOut size={16} />
            <span>End Session Now</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
