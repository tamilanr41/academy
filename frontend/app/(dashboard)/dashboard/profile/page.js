'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientGet, clientPatch, clientPost, clientDelete, uploadAvatar, uploadStudentDocument } from '@/lib/client';
import { PageHeader } from '@/components/dashboard/Shell';
import { Avatar, Badge, Button, Card, CardBody, CardHeader, Field, Input, Select, Textarea } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { markProfileComplete } from '@/components/dashboard/ProfileGuard';

const FIELD_LABELS = {
  name: 'Full name',
  phone: 'Phone number',
  dateOfBirth: 'Date of birth',
  gender: 'Gender',
  qualification: 'Educational qualification',
  'address.line1': 'Address',
  'address.city': 'City',
  'address.state': 'State',
  'address.pincode': 'Pincode',
  'guardian.name': 'Guardian name',
  'guardian.phone': 'Guardian phone',
};

const GENDER_OPTIONS = [
  ['', 'Select…'],
  ['female', 'Female'],
  ['male', 'Male'],
  ['other', 'Other'],
  ['prefer_not_to_say', 'Prefer not to say'],
];

const MODE_OPTIONS = [
  ['', 'No preference'],
  ['online', 'Online'],
  ['offline', 'Offline (classroom)'],
  ['hybrid', 'Hybrid'],
];

const SOURCE_OPTIONS = [
  ['', 'Select…'],
  ['google', 'Google / Search'],
  ['social_media', 'Social media'],
  ['friend', 'Friend'],
  ['relative', 'Relative'],
  ['walk_in', 'Walk-in'],
  ['advertisement', 'Advertisement'],
  ['other', 'Other'],
];

const DOCUMENT_TYPES = [
  ['aadhaar', 'Aadhaar card'],
  ['pan', 'PAN card'],
  ['passport', 'Passport'],
  ['driving_license', 'Driving licence'],
  ['student_id', 'Student ID'],
  ['other', 'Other document'],
];

const emptyForm = {
  name: '',
  phone: '',
  alternatePhone: '',
  whatsapp: '',
  dateOfBirth: '',
  gender: '',
  qualification: '',
  college: '',
  yearOfStudy: '',
  specialization: '',
  occupation: '',
  interestedCourse: '',
  preferredMode: '',
  preferredTiming: '',
  source: '',
  bio: '',
  address: { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' },
  guardian: { name: '', phone: '', relation: '' },
  emergencyContact: { name: '', phone: '', relation: '' },
  documents: [],
};

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

export default function MyProfile() {
  const toast = useToast();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isComplete, setIsComplete] = useState(null);
  const [missing, setMissing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [doc, setDoc] = useState({ type: 'aadhaar', number: '', file: null });
  const [docUploading, setDocUploading] = useState(false);
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });
  const [forced, setForced] = useState(false);
  const [redirectWhenDone, setRedirectWhenDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isForced = params.get('complete') === '1' || params.get('required') === '1';
    setForced(isForced);
    setRedirectWhenDone(isForced);

    setLoading(true);
    clientGet('/api/student/profile', { auth: true }).then((res) => {
      setLoading(false);
      if (!res.ok || !res.data) {
        toast.error(res.message || 'Could not load your profile');
        return;
      }
      const profile = res.data.profile || {};
      setUser(res.data.user);
      setIsComplete(res.data.isComplete);
      setMissing(res.data.missing || []);
      setForm({
        ...emptyForm,
        ...profile,
        name: res.data.user?.name || '',
        phone: res.data.user?.phone || '',
        dateOfBirth: toDateInput(profile.dateOfBirth),
        address: { ...emptyForm.address, ...(profile.address || {}) },
        guardian: { ...emptyForm.guardian, ...(profile.guardian || {}) },
        emergencyContact: { ...emptyForm.emergencyContact, ...(profile.emergencyContact || {}) },
        documents: profile.documents || [],
      });
    });
  }, [toast]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setNested = (group, key, value) => setForm((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }));

  const missingLabels = useMemo(() => missing.map((key) => FIELD_LABELS[key] || key), [missing]);

  const save = async () => {
    setSaving(true);
    const payload = { ...form };
    delete payload.documents;
    const res = await clientPatch('/api/student/profile', payload);
    setSaving(false);
    if (!res.ok) {
      toast.error(res.message || 'Could not save your profile');
      return;
    }
    setIsComplete(res.data.isComplete);
    setMissing(res.data.missing || []);
    setUser(res.data.user);
    setForm((prev) => ({ ...prev, name: res.data.user?.name || prev.name, phone: res.data.user?.phone || prev.phone }));
    markProfileComplete(res.data.isComplete === true);
    toast.success(res.data.isComplete ? 'Profile complete. Thank you!' : 'Profile saved');
    if (res.data.isComplete && redirectWhenDone) router.replace('/dashboard');
  };

  const changePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPhotoUploading(true);
    const res = await uploadAvatar(file);
    setPhotoUploading(false);
    if (!res.ok) {
      toast.error(res.message || 'Could not upload the photo');
      return;
    }
    setUser((prev) => ({ ...prev, avatar: res.data.avatar }));
    toast.success('Profile photo updated');
  };

  const uploadDoc = async () => {
    if (!doc.file) {
      toast.error('Choose a file to upload');
      return;
    }
    setDocUploading(true);
    const res = await uploadStudentDocument(doc.file, { type: doc.type, number: doc.number });
    setDocUploading(false);
    if (!res.ok) {
      toast.error(res.message || 'Could not upload the document');
      return;
    }
    setForm((prev) => ({ ...prev, documents: res.data.documents || [] }));
    setDoc({ type: 'aadhaar', number: '', file: null });
    toast.success('Document uploaded');
  };

  const removeDoc = async (id) => {
    const res = await clientDelete(`/api/student/documents/${id}`);
    if (!res.ok) {
      toast.error(res.message || 'Could not remove the document');
      return;
    }
    setForm((prev) => ({ ...prev, documents: res.data.documents || [] }));
    toast.success('Document removed');
  };

  const changePwd = async () => {
    setLoading(true);
    const res = await clientPost('/api/auth/change-password', pwd);
    setLoading(false);
    if (res.ok) {
      toast.success('Password updated');
      setPwd({ currentPassword: '', newPassword: '' });
    } else {
      toast.error(res.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Keep your details up to date — the academy uses them for batches, certificates and support." />

      {isComplete === false && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">
            {forced ? 'Please complete your profile to continue using the dashboard.' : 'Your profile is incomplete.'}
          </p>
          {missingLabels.length > 0 && (
            <p className="mt-1 text-amber-800">Still needed: {missingLabels.join(', ')}</p>
          )}
        </div>
      )}

      {isComplete === true && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <Badge tone="success">Complete</Badge>
          Your profile is complete.
          {redirectWhenDone && (
            <Button variant="secondary" className="ml-auto" onClick={() => router.replace('/dashboard')}>
              Back to dashboard
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Personal details" description="Fields marked * are required." />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="Email" hint="Contact the academy to change your email.">
              <Input value={user?.email || ''} disabled />
            </Field>
            <Field label="Phone" required>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Alternate phone">
              <Input value={form.alternatePhone} onChange={(e) => set('alternatePhone', e.target.value)} />
            </Field>
            <Field label="WhatsApp number">
              <Input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
            </Field>
            <Field label="Date of birth" required>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
            </Field>
            <Field label="Gender" required>
              <Select value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                {GENDER_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Occupation">
              <Input value={form.occupation} onChange={(e) => set('occupation', e.target.value)} placeholder="Student / Working professional" />
            </Field>
            <div className="lg:col-span-2">
              <Field label="About you" hint="Optional — anything the trainers should know.">
                <Textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={3} />
              </Field>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Photo" />
          <CardBody className="space-y-3">
            <div className="flex items-center gap-4">
              <Avatar src={user?.avatar?.url} name={user?.name || ''} size={64} />
              <label className="cursor-pointer rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                {photoUploading ? 'Uploading…' : 'Change photo'}
                <input type="file" accept="image/*" className="hidden" onChange={changePhoto} disabled={photoUploading} />
              </label>
            </div>
            <p className="text-xs text-slate-500">JPEG, PNG or WEBP. A clear face photo helps us issue your ID card.</p>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Address" />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Address line 1" required>
                <Input value={form.address.line1} onChange={(e) => setNested('address', 'line1', e.target.value)} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Address line 2">
                <Input value={form.address.line2} onChange={(e) => setNested('address', 'line2', e.target.value)} />
              </Field>
            </div>
            <Field label="City" required>
              <Input value={form.address.city} onChange={(e) => setNested('address', 'city', e.target.value)} />
            </Field>
            <Field label="State" required>
              <Input value={form.address.state} onChange={(e) => setNested('address', 'state', e.target.value)} />
            </Field>
            <Field label="Pincode" required>
              <Input value={form.address.pincode} onChange={(e) => setNested('address', 'pincode', e.target.value)} />
            </Field>
            <Field label="Country">
              <Input value={form.address.country} onChange={(e) => setNested('address', 'country', e.target.value)} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Guardian / emergency contact" description="We contact them only if needed." />
          <CardBody className="space-y-3">
            <Field label="Guardian name" required>
              <Input value={form.guardian.name} onChange={(e) => setNested('guardian', 'name', e.target.value)} />
            </Field>
            <Field label="Guardian phone" required>
              <Input value={form.guardian.phone} onChange={(e) => setNested('guardian', 'phone', e.target.value)} />
            </Field>
            <Field label="Relation">
              <Input value={form.guardian.relation} onChange={(e) => setNested('guardian', 'relation', e.target.value)} placeholder="Father / Mother / Spouse" />
            </Field>
            <div className="border-t border-slate-100 pt-3">
              <Field label="Emergency contact name">
                <Input value={form.emergencyContact.name} onChange={(e) => setNested('emergencyContact', 'name', e.target.value)} />
              </Field>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Emergency phone">
                  <Input value={form.emergencyContact.phone} onChange={(e) => setNested('emergencyContact', 'phone', e.target.value)} />
                </Field>
                <Field label="Relation">
                  <Input value={form.emergencyContact.relation} onChange={(e) => setNested('emergencyContact', 'relation', e.target.value)} />
                </Field>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Education & learning preference" />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            <Field label="Highest qualification" required>
              <Input value={form.qualification} onChange={(e) => set('qualification', e.target.value)} placeholder="B.E CSE / +2 / Diploma" />
            </Field>
            <Field label="Specialisation / stream">
              <Input value={form.specialization} onChange={(e) => set('specialization', e.target.value)} />
            </Field>
            <Field label="College / school">
              <Input value={form.college} onChange={(e) => set('college', e.target.value)} />
            </Field>
            <Field label="Year of study / passed out">
              <Input value={form.yearOfStudy} onChange={(e) => set('yearOfStudy', e.target.value)} placeholder="2026 / III year" />
            </Field>
            <Field label="Interested course">
              <Input value={form.interestedCourse} onChange={(e) => set('interestedCourse', e.target.value)} />
            </Field>
            <Field label="Preferred mode">
              <Select value={form.preferredMode} onChange={(e) => set('preferredMode', e.target.value)}>
                {MODE_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Preferred timing">
              <Input value={form.preferredTiming} onChange={(e) => set('preferredTiming', e.target.value)} placeholder="Weekday evenings / Weekend" />
            </Field>
            <Field label="How did you hear about us?">
              <Select value={form.source} onChange={(e) => set('source', e.target.value)}>
                {SOURCE_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Identity documents" description="Optional — needed before batch enrolment." />
          <CardBody className="space-y-4">
            <div className="space-y-3">
              <Field label="Document type">
                <Select value={doc.type} onChange={(e) => setDoc({ ...doc, type: e.target.value })}>
                  {DOCUMENT_TYPES.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Document number">
                <Input value={doc.number} onChange={(e) => setDoc({ ...doc, number: e.target.value })} />
              </Field>
              <Field label="File" hint="Image or PDF, up to the size limit.">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
                  onChange={(e) => setDoc({ ...doc, file: e.target.files?.[0] || null })}
                />
              </Field>
              <Button onClick={uploadDoc} disabled={docUploading}>{docUploading ? 'Uploading…' : 'Upload document'}</Button>
            </div>

            {form.documents.length > 0 && (
              <ul className="space-y-2 border-t border-slate-100 pt-3">
                {form.documents.map((item) => (
                  <li key={item._id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">
                      <span className="font-medium">{item.type}</span>
                      {item.number ? ` · ${item.number}` : ''}
                    </span>
                    <span className="flex items-center gap-2">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">View</a>
                      <button type="button" className="text-rose-600 hover:underline" onClick={() => removeDoc(item._id)}>Remove</button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Change password" />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            <Field label="Current password">
              <Input type="password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} />
            </Field>
            <Field label="New password" hint="At least 8 characters with letters and numbers.">
              <Input type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Button variant="secondary" onClick={changePwd} disabled={loading}>Update password</Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="sticky bottom-4 flex justify-end">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-sm">
          {isComplete === false && <span className="text-xs text-slate-500">{missing.length} field{missing.length === 1 ? '' : 's'} remaining</span>}
          <Button onClick={save} disabled={saving || loading}>{saving ? 'Saving…' : 'Save profile'}</Button>
        </div>
      </div>
    </div>
  );
}
