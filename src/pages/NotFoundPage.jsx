import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="w-full max-w-md p-8 bg-surface border border-border rounded-3xl shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent mx-auto">
          <HelpCircle size={36} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">
            Page Not Found (404)
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            The page or room you are looking for does not exist.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/')}
          className="w-full gap-2 text-sm font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          <span>Return to Home</span>
        </Button>
      </div>
    </div>
  );
}
