import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, Check, QrCode } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';

export function RoomQrModal({ isOpen, onClose, code, sessionName }) {
  const [copied, setCopied] = useState(false);

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${code}`
    : `/join/${code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join With QR Code"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center">
        <p className="text-xs text-muted mb-6">
          Audience members can point their phone camera at this QR code to join <strong className="text-white">{sessionName}</strong> instantly.
        </p>

        {/* Large QR Display */}
        <div className="p-4 bg-white rounded-2xl shadow-2xl mb-6">
          <QRCodeCanvas
            value={joinUrl}
            size={260}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#0B0F17"
          />
        </div>

        {/* Session Code Badge */}
        <div className="w-full flex items-center justify-between p-3.5 bg-background border border-border rounded-xl mb-4">
          <div className="text-left">
            <span className="block text-[10px] uppercase font-bold text-muted tracking-wider">
              Session Code
            </span>
            <span className="text-xl font-mono font-black tracking-widest text-accent">
              {code}
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            className="gap-2 text-xs"
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </Button>
        </div>

        <p className="text-[11px] text-muted font-mono break-all px-2">
          {joinUrl}
        </p>
      </div>
    </Modal>
  );
}
