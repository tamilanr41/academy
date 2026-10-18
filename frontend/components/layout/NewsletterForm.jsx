'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { clientPost } from '@/lib/client';
import { useToast } from '@/components/ui/Toast';

export function NewsletterForm({ className }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const result = await clientPost('/api/newsletter/subscribe', { email });
    setLoading(false);
    if (result.ok) {
      toast.success(result.message || 'Subscribed successfully');
      setEmail('');
    } else {
      toast.error(result.message || 'Subscription failed');
    }
  };

  return (
    <form onSubmit={submit} className={className}>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="input border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-brand-500"
          aria-label="Email address"
        />
        <button
          type="submit"
          className="btn shrink-0 bg-white text-brand-700 hover:bg-slate-100 disabled:opacity-60"
          disabled={loading}
          aria-label="Subscribe"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
