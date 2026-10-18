'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { clientPost } from '@/lib/client';
import { Button, Field, Input, Select, Textarea } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { ENQUIRY_TYPES } from '@/lib/constants';

const EMPTY = { name: '', email: '', phone: '', subject: '', type: 'course', message: '', honeypot: '' };

export function EnquiryForm({ compact = false, defaultSubject = '' }) {
  const toast = useToast();
  const [form, setForm] = useState({ ...EMPTY, subject: defaultSubject });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    const result = await clientPost('/api/enquiries', form);
    setLoading(false);

    if (result.ok) {
      toast.success(result.message || 'Thanks! We will get back to you shortly.');
      setForm({ ...EMPTY, subject: defaultSubject });
      return;
    }
    if (result.errors?.length) {
      setErrors(Object.fromEntries(result.errors.map((error) => [error.field, error.message])));
    }
    toast.error(result.message || 'Please review the highlighted fields');
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" value={form.honeypot} onChange={update('honeypot')} />

      <div className={compact ? 'space-y-4' : 'grid gap-4 sm:grid-cols-2'}>
        <Field label="Full name" htmlFor="enq-name" error={errors.name} required>
          <Input id="enq-name" value={form.name} onChange={update('name')} placeholder="Your name" error={errors.name} />
        </Field>
        <Field label="Email" htmlFor="enq-email" error={errors.email} required>
          <Input id="enq-email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" error={errors.email} />
        </Field>
        <Field label="Phone" htmlFor="enq-phone" error={errors.phone}>
          <Input id="enq-phone" value={form.phone} onChange={update('phone')} placeholder="10-digit mobile" error={errors.phone} />
        </Field>
        <Field label="Enquiry type" htmlFor="enq-type">
          <Select id="enq-type" value={form.type} onChange={update('type')}>
            {ENQUIRY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Subject" htmlFor="enq-subject" error={errors.subject}>
        <Input id="enq-subject" value={form.subject} onChange={update('subject')} placeholder="How can we help?" error={errors.subject} />
      </Field>

      <Field label="Message" htmlFor="enq-message" error={errors.message} required>
        <Textarea id="enq-message" rows={4} value={form.message} onChange={update('message')} placeholder="Tell us what you're looking for…" error={errors.message} />
      </Field>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? 'Sending…' : 'Send enquiry'} <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
