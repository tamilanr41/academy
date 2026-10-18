'use client';

import { useEffect, useState } from 'react';
import { clientGet, clientPatch } from '@/lib/client';
import { buildQuery, formatDate, humanize } from '@/lib/format';
import { ENQUIRY_STATUSES, ENQUIRY_TYPES, getStatusMeta } from '@/lib/constants';
import { PageHeader } from '@/components/dashboard/Shell';
import { Card, Badge, Button, Field, Input, Select, Textarea, EmptyState } from '@/components/ui/primitives';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';

export default function AdminEnquiriesPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ status: '', note: '', followUpDate: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await clientGet(`/api/admin/enquiries${buildQuery({ page, search, status })}`);
    setLoading(false);
    if (res.ok) { setItems(res.data||[]); setMeta(res.meta); } else toast.error(res.message||'Failed');
  };

  useEffect(()=>{load();},[page,search,status]);

  const open = async (row) => {
    setDetailOpen(true);
    setDetail(row);
    const res = await clientGet(`/api/admin/enquiries/${row._id}`);
    if (res.ok) {
      const d = res.data;
      setDetail(d);
      setForm({ status: d.status, note: '', followUpDate: d.followUpDate ? new Date(d.followUpDate).toISOString().slice(0,10) : '' });
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!detail) return;
    setSaving(true);
    const res = await clientPatch(`/api/admin/enquiries/${detail._id}`, form);
    setSaving(false);
    if (res.ok) { toast.success('Enquiry updated'); setDetailOpen(false); load(); } else toast.error(res.message||'Failed');
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'type', header: 'Type', render: (r) => humanize(r.type) },
    { key: 'subject', header: 'Subject', render: (r) => <span className="line-clamp-1 max-w-xs">{r.subject}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={getStatusMeta(ENQUIRY_STATUSES,r.status).tone}>{humanize(r.status)}</Badge> },
    { key: 'createdAt', header: 'Date', render: (r) => formatDate(r.createdAt) },
    { key: 'actions', header: '', render: (r) => <Button size="sm" variant="ghost" onClick={()=>open(r)}>View</Button> },
  ];

  return (
    <div>
      <PageHeader title="Enquiries" description="Track and respond to enquiries." />
      <Card>
        <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4">
          <Input placeholder="Search name/email/subject" value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}} className="min-w-[220px] flex-1"/>
          <Select value={status} onChange={(e)=>{setStatus(e.target.value);setPage(1);}}>
            <option value="">All statuses</option>
            {ENQUIRY_STATUSES.map(s=> <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>
        <div className="p-4">
          <DataTable columns={columns} rows={items} loading={loading} empty={<EmptyState title="No enquiries"/>} />
          {meta && <Pagination meta={meta} onPageChange={setPage}/>}
        </div>
      </Card>

      <Modal open={detailOpen} onClose={()=>setDetailOpen(false)} title="Enquiry details" size="lg">
        {!detail ? 'Loading…' : (
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name"><Input value={detail.name} readOnly/></Field>
              <Field label="Email"><Input value={detail.email} readOnly/></Field>
              <Field label="Phone"><Input value={detail.phone||'—'} readOnly/></Field>
              <Field label="Type"><Input value={humanize(detail.type)} readOnly/></Field>
              <Field label="Subject" className="sm:col-span-2"><Input value={detail.subject} readOnly/></Field>
              <Field label="Message" className="sm:col-span-2"><Textarea value={detail.message} readOnly rows={3}/></Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Status">
                <Select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}>
                  {ENQUIRY_STATUSES.map(s=> <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </Field>
              <Field label="Follow-up date"><Input type="date" value={form.followUpDate} onChange={(e)=>setForm({...form,followUpDate:e.target.value})}/></Field>
            </div>
            <Field label="Add staff note"><Textarea rows={3} value={form.note} onChange={(e)=>setForm({...form,note:e.target.value})} placeholder="Internal note"/></Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={()=>setDetailOpen(false)}>Close</Button>
              <Button type="submit" disabled={saving}>{saving?'Saving…':'Save'}</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
