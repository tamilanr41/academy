'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { clientFetch, clientPost } from '@/lib/client';
import { Button, Field, Input, Select, Textarea } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { COURSE_MODES } from '@/lib/constants';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  course: '',
  batch: '',
  mode: 'offline',
  qualification: '',
  city: '',
  message: '',
  honeypot: '',
};

export function ApplyForm({ courses = [], defaultCourse = '', prefill = null }) {
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ ...EMPTY, course: defaultCourse, ...(prefill || {}) });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [success, setSuccess] = useState(null);

  const update = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [key]: value, ...(key === 'course' ? { batch: '' } : {}) }));
  };

  useEffect(() => {
    if (!form.course) {
      setBatches([]);
      return;
    }
    let active = true;
    clientFetch(`/api/batches?course=${form.course}`).then((result) => {
      if (active && result.ok) setBatches(result.data || []);
    });
    return () => {
      active = false;
    };
  }, [form.course]);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    const payload = { ...form };
    if (!payload.batch) delete payload.batch;
    const result = await clientPost('/api/applications', payload);
    setLoading(false);

    if (result.ok) {
      toast.success('Application submitted');
      setSuccess(result.data.application);
      setForm({ ...EMPTY, course: defaultCourse, ...(prefill || {}) });
      router.refresh();
      return;
    }
    if (result.errors?.length) {
      setErrors(Object.fromEntries(result.errors.map((error) => [error.field, error.message])));
    }
    toast.error(result.message || 'Please review the highlighted fields');
  };

  if (success) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h3 className="mt-4 text-xl font-bold text-slate-900">Application received</h3>
        <p className="mt-2 text-sm text-slate-600">
          Your reference number is{' '}
          <span className="font-mono font-bold text-slate-900">{success.referenceNumber}</span>. Our admissions team will contact
          you shortly.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/courses">Browse more courses</Button>
          <Button variant="secondary" onClick={() => setSuccess(null)}>
            Submit another application
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" value={form.honeypot} onChange={update('honeypot')} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="app-name" error={errors.name} required>
          <Input id="app-name" value={form.name} onChange={update('name')} placeholder="Your full name" error={errors.name} />
        </Field>
        <Field label="Email" htmlFor="app-email" error={errors.email} required>
          <Input id="app-email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" error={errors.email} />
        </Field>
        <Field label="Phone" htmlFor="app-phone" error={errors.phone} required>
          <Input id="app-phone" value={form.phone} onChange={update('phone')} placeholder="10-digit mobile" error={errors.phone} />
        </Field>
        <Field label="City" htmlFor="app-city" error={errors.city}>
          <Input id="app-city" value={form.city} onChange={update('city')} placeholder="Your city" error={errors.city} />
        </Field>
        <Field label="Course" htmlFor="app-course" error={errors.course} required>
          <Select id="app-course" value={form.course} onChange={update('course')} error={errors.course}>
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Preferred batch" htmlFor="app-batch" error={errors.batch} hint={form.course && !batches.length ? 'No scheduled batches yet — leave blank.' : undefined}>
          <Select id="app-batch" value={form.batch} onChange={update('batch')} error={errors.batch} disabled={!form.course}>
            <option value="">No preference</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.name}
                {batch.startDate ? ` · starts ${new Date(batch.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` : ''}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Preferred mode" htmlFor="app-mode" error={errors.mode}>
          <Select id="app-mode" value={form.mode} onChange={update('mode')}>
            {COURSE_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Highest qualification" htmlFor="app-qualification" error={errors.qualification}>
          <Input id="app-qualification" value={form.qualification} onChange={update('qualification')} placeholder="e.g. B.Tech, B.Com" error={errors.qualification} />
        </Field>
      </div>

      <Field label="Message" htmlFor="app-message" error={errors.message} hint="Tell us about your goals or any questions you have.">
        <Textarea id="app-message" rows={4} value={form.message} onChange={update('message')} placeholder="Optional message…" error={errors.message} />
      </Field>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? 'Submitting…' : 'Submit application'}
      </Button>
      <p className="text-xs text-slate-500">
        By submitting, you agree to be contacted about your application. We never share your details.
      </p>
    </form>
  );
}
