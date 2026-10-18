'use client';

import { useEffect, useState } from 'react';
import { clientGet, clientPatch } from '@/lib/client';
import { PageHeader } from '@/components/dashboard/Shell';
import { Card, CardHeader, CardBody, Button, Field, Input, Textarea } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';

const EMPTY = {
  academyName: '',
  tagline: '',
  contact: { email: '', phone: '', alternatePhone: '', mapEmbedUrl: '' },
  brand: { primaryColor: '#971F05', accentColor: '#F4B9B9' },
  seo: { siteTitle: '', metaDescription: '', keywords: [] },
  social: { facebook: '', instagram: '', youtube: '', linkedin: '', twitter: '', whatsapp: '' },
  media: { heroImage: '', heroVideoUrl: '', promoVideoUrl: '', promoPoster: '', campusVideoUrl: '', campusPoster: '' },
};

export default function AdminSettingsPage() {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    clientGet('/api/admin/settings', { auth: true }).then((r) => {
      if (!r.ok) return;
      const data = r.data || {};
      setForm({
        ...EMPTY,
        ...data,
        contact: { ...EMPTY.contact, ...data.contact },
        brand: { ...EMPTY.brand, ...data.brand },
        seo: { ...EMPTY.seo, ...data.seo, keywords: data.seo?.keywords || [] },
        social: { ...EMPTY.social, ...data.social },
        media: { ...EMPTY.media, ...data.media },
      });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const r = await clientPatch('/api/admin/settings', form);
    setSaving(false);
    if (r.ok) toast.success('Settings updated');
    else toast.error(r.message || 'Failed to save settings');
  };

  const set = (section, key, value) =>
    setForm((current) => ({ ...current, [section]: { ...current[section], [key]: value } }));

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Branding, contact details, homepage media and SEO."
        action={<Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Academy" description="Public name and tagline." />
          <CardBody className="space-y-3">
            <Field label="Academy name"><Input value={form.academyName} onChange={(e) => setForm({ ...form, academyName: e.target.value })} /></Field>
            <Field label="Tagline"><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Contact" description="How students reach you." />
          <CardBody className="space-y-3">
            <Field label="Email"><Input type="email" value={form.contact.email} onChange={(e) => set('contact', 'email', e.target.value)} /></Field>
            <Field label="Phone"><Input value={form.contact.phone} onChange={(e) => set('contact', 'phone', e.target.value)} /></Field>
            <Field label="Alternate phone"><Input value={form.contact.alternatePhone} onChange={(e) => set('contact', 'alternatePhone', e.target.value)} /></Field>
            <Field label="Map embed URL" hint="Google Maps embed link shown on the contact page."><Input value={form.contact.mapEmbedUrl} onChange={(e) => set('contact', 'mapEmbedUrl', e.target.value)} /></Field>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Homepage media" description="Hero video and promo video. Accepts a YouTube, Vimeo or direct .mp4 link — leave blank to use the animated fallback." />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            <Field label="Hero background image" className="sm:col-span-2"><Input value={form.media.heroImage} onChange={(e) => set('media', 'heroImage', e.target.value)} /></Field>
            <Field label="Hero background video" hint="Plays muted & looping behind the hero."><Input placeholder="https://youtu.be/…" value={form.media.heroVideoUrl} onChange={(e) => set('media', 'heroVideoUrl', e.target.value)} /></Field>
            <Field label="Promo video" hint="Opens in the “Watch our story” modal."><Input placeholder="https://vimeo.com/…" value={form.media.promoVideoUrl} onChange={(e) => set('media', 'promoVideoUrl', e.target.value)} /></Field>
            <Field label="Promo poster image"><Input value={form.media.promoPoster} onChange={(e) => set('media', 'promoPoster', e.target.value)} /></Field>
            <Field label="Campus video"><Input placeholder="https://…/campus.mp4" value={form.media.campusVideoUrl} onChange={(e) => set('media', 'campusVideoUrl', e.target.value)} /></Field>
            <Field label="Campus poster image" className="sm:col-span-2"><Input value={form.media.campusPoster} onChange={(e) => set('media', 'campusPoster', e.target.value)} /></Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="SEO" description="Search engine and social preview." />
          <CardBody className="space-y-3">
            <Field label="Site title"><Input value={form.seo.siteTitle} onChange={(e) => set('seo', 'siteTitle', e.target.value)} /></Field>
            <Field label="Meta description"><Textarea rows={3} value={form.seo.metaDescription} onChange={(e) => set('seo', 'metaDescription', e.target.value)} /></Field>
            <Field label="Keywords" hint="Comma separated."><Input value={(form.seo.keywords || []).join(', ')} onChange={(e) => set('seo', 'keywords', e.target.value.split(',').map((k) => k.trim()).filter(Boolean))} /></Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Social" description="Links shown in the footer." />
          <CardBody className="space-y-3">
            {['facebook', 'instagram', 'youtube', 'linkedin', 'twitter', 'whatsapp'].map((key) => (
              <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}><Input value={form.social[key] || ''} onChange={(e) => set('social', key, e.target.value)} /></Field>
            ))}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Brand" description="Primary and accent colours used across the site." />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            <Field label="Primary color"><Input type="text" value={form.brand.primaryColor} onChange={(e) => set('brand', 'primaryColor', e.target.value)} /></Field>
            <Field label="Accent color"><Input type="text" value={form.brand.accentColor} onChange={(e) => set('brand', 'accentColor', e.target.value)} /></Field>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
      </div>
    </div>
  );
}
