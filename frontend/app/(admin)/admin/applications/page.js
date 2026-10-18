'use client';

import { useEffect, useState } from 'react';
import { Eye, FileText, UserCheck } from 'lucide-react';
import { clientGet, clientPatch, clientPost } from '@/lib/client';
import { buildQuery, formatDate, humanize } from '@/lib/format';
import { APPLICATION_STATUSES, getStatusMeta } from '@/lib/constants';
import { PageHeader } from '@/components/dashboard/Shell';
import { Card, Badge, Button, Field, Input, Select, Textarea, EmptyState } from '@/components/ui/primitives';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';

export default function AdminApplicationsPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [statusForm, setStatusForm] = useState({ status: '', note: '' });
  const [note, setNote] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const result = await clientGet(`/api/admin/applications${buildQuery({ page, search, status })}`);
    setLoading(false);
    if (result.ok) {
      setItems(result.data || []);
      setMeta(result.meta);
    } else toast.error(result.message || 'Failed to load applications');
  };

  const loadAssignees = async () => {
    const result = await clientGet('/api/admin/users?limit=100');
    if (result.ok) {
      setAssignees((result.data || []).filter((u) => ['super_admin','admin','staff','trainer'].includes(u.role)));
    }
  };

  useEffect(() => { load(); }, [page, search, status]);
  useEffect(() => { loadAssignees(); }, []);

  const openDetail = async (row) => {
    setSelected(row);
    setDetailOpen(true);
    const result = await clientGet(`/api/admin/applications/${row._id}`);
    if (result.ok) {
      const d = result.data;
      setDetail(d);
      setStatusForm({ status: d.status, note: '' });
      setAssignTo(d.assignedTo?._id || '');
      setFollowUp(d.followUpDate ? new Date(d.followUpDate).toISOString().slice(0, 10) : '');
      setNote('');
    }
  };

  const updateStatus = async (e) => {
    e.preventDefault();
    if (!detail) return;
    setSaving(true);
    const res = await clientPatch(`/api/admin/applications/${detail._id}/status`, statusForm);
    setSaving(false);
    if (res.ok) { toast.success('Status updated'); openDetail(detail); load(); }
    else toast.error(res.message || 'Update failed');
  };
  const addNote = async (e) => {
    e.preventDefault();
    if (!detail || !note) return;
    setSaving(true);
    const res = await clientPost(`/api/admin/applications/${detail._id}/notes`, { note });
    setSaving(false);
    if (res.ok) { toast.success('Note added'); setNote(''); openDetail(detail); }
    else toast.error(res.message || 'Failed');
  };
  const assign = async () => {
    if (!detail) return;
    setSaving(true);
    const res = await clientPatch(`/api/admin/applications/${detail._id}/assign`, { assignedTo: assignTo || null });
    setSaving(false);
    if (res.ok) { toast.success('Assigned'); openDetail(detail); }
    else toast.error(res.message || 'Failed');
  };
  const setFollowup = async () => {
    if (!detail) return;
    setSaving(true);
    const res = await clientPatch(`/api/admin/applications/${detail._id}/follow-up`, { followUpDate: followUp || null });
    setSaving(false);
    if (res.ok) { toast.success('Follow-up updated'); openDetail(detail); }
    else toast.error(res.message || 'Failed');
  };

  const columns = [
    { key: 'referenceNumber', header: 'Ref' },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'course', header: 'Course', render: (r) => r.course?.title || '—' },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={getStatusMeta(APPLICATION_STATUSES, r.status).tone}>{humanize(r.status)}</Badge> },
    { key: 'createdAt', header: 'Submitted', render: (r) => formatDate(r.createdAt) },
    { key: 'actions', header: '', render: (r) => <Button size="sm" variant="ghost" onClick={() => openDetail(r)}><Eye className="h-4 w-4"/> View</Button> },
  ];

  return (
    <div>
      <PageHeader title="Applications" description="Review, qualify and manage student applications." />
      <Card>
        <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4">
          <Input placeholder="Search name/email/ref…" value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}} className="min-w-[220px] flex-1" />
          <Select value={status} onChange={(e)=>{setStatus(e.target.value);setPage(1);}}>
            <option value="">All statuses</option>
            {APPLICATION_STATUSES.map(s=> <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>
        <div className="p-4">
          <DataTable columns={columns} rows={items} loading={loading} empty={<EmptyState title="No applications" description="New applications appear here."/>} />
          {meta && <Pagination meta={meta} onPageChange={setPage}/>}
        </div>
      </Card>

      <Modal open={detailOpen} onClose={()=>setDetailOpen(false)} title="Application details" size="xl">
        {!detail ? <p className="text-sm text-slate-500">Loading…</p> : (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Reference"><Input value={detail.referenceNumber} readOnly/></Field>
              <Field label="Status"><Badge tone={getStatusMeta(APPLICATION_STATUSES, detail.status).tone}>{humanize(detail.status)}</Badge></Field>
              <Field label="Name"><Input value={detail.name} readOnly/></Field>
              <Field label="Email"><Input value={detail.email} readOnly/></Field>
              <Field label="Phone"><Input value={detail.phone} readOnly/></Field>
              <Field label="Course"><Input value={detail.course?.title} readOnly/></Field>
              <Field label="Submitted"><Input value={formatDate(detail.createdAt)} readOnly/></Field>
              <Field label="Assigned to"><Input value={detail.assignedTo?.name || 'Unassigned'} readOnly/></Field>
            </div>

            {detail.message && (
              <Field label="Message"><Textarea value={detail.message} readOnly rows={3}/></Field>
            )}

            <Card className="p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4"/> Update status</h3>
              <form onSubmit={updateStatus} className="grid gap-3 sm:grid-cols-3">
                <Select value={statusForm.status} onChange={(e)=>setStatusForm({...statusForm,status:e.target.value})} required>
                  {APPLICATION_STATUSES.map(s=> <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
                <div className="sm:col-span-2"><Input placeholder="Note (optional)" value={statusForm.note} onChange={(e)=>setStatusForm({...statusForm,note:e.target.value})}/></div>
                <Button type="submit" disabled={saving}>Update</Button>
              </form>
            </Card>

            <Card className="p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><UserCheck className="h-4 w-4"/> Assignment & follow-up</h3>
              <div className="grid gap-3 sm:grid-cols-3 items-end">
                <Field label="Assign to">
                  <Select value={assignTo} onChange={(e)=>setAssignTo(e.target.value)}>
                    <option value="">Unassigned</option>
                    {assignees.map(u=> <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                  </Select>
                </Field>
                <Button variant="secondary" onClick={assign} disabled={saving}>Assign</Button>
                <div className="sm:col-span-3 grid gap-3 sm:grid-cols-3 items-end">
                  <Field label="Follow-up date"><Input type="date" value={followUp} onChange={(e)=>setFollowUp(e.target.value)}/></Field>
                  <Button variant="secondary" onClick={setFollowup} disabled={saving}>Save follow-up</Button>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="mb-3 text-sm font-semibold">Add internal note</h3>
              <form onSubmit={addNote} className="space-y-2">
                <Textarea rows={3} value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Add note visible to staff only"/>
                <Button type="submit" disabled={saving}>Add note</Button>
              </form>
              {detail.staffNotes?.length > 0 && (
                <div className="mt-3 space-y-2 text-sm">
                  {detail.staffNotes.map((n,i)=> (
                    <div key={i} className="rounded-lg bg-slate-50 p-2">
                      <p>{n.note}</p>
                      <p className="text-xs text-slate-500">{formatDate(n.at)} {n.by?.name && `• ${n.by.name}`}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
