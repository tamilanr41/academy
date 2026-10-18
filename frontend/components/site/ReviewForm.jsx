'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { clientPost } from '@/lib/client';
import { Button, Field, Input, Textarea } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';

export function ReviewForm({ courseId }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const result = await clientPost(`/api/courses/${courseId}/reviews`, form);
    setLoading(false);
    if (result.ok) {
      toast.success('Thanks! Your review will appear once approved.');
      setForm({ name: '', rating: 5, comment: '' });
    } else {
      toast.error(result.message || 'Could not submit your review');
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <h3 className="text-base font-semibold text-slate-900">Share your experience</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="rev-name" required>
          <Input id="rev-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
        </Field>
        <Field label="Rating">
          <div className="flex items-center gap-1 pt-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" onClick={() => setForm({ ...form, rating: value })} aria-label={`${value} star`}>
                <Star className={value <= form.rating ? 'h-6 w-6 fill-amber-400 text-amber-400' : 'h-6 w-6 text-slate-300'} />
              </button>
            ))}
          </div>
        </Field>
      </div>
      <Field label="Review" htmlFor="rev-comment" required>
        <Textarea id="rev-comment" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="What did you like about the course?" required />
      </Field>
      <Button type="submit" disabled={loading}>
        {loading ? 'Submitting…' : 'Submit review'}
      </Button>
    </form>
  );
}
