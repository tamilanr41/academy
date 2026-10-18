'use client';

import { useEffect, useState } from 'react';
import { clientGet, clientPost, clientPatch } from '@/lib/client';
import { buildQuery, formatDate, humanize } from '@/lib/format';
import { ENROLLMENT_STATUSES, getStatusMeta } from '@/lib/constants';
import { PageHeader } from '@/components/dashboard/Shell';
import { Card, Badge, Button, Field, Input, Select, EmptyState } from '@/components/ui/primitives';
import { DataTable } from '@/components/ui/DataTable';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';

export default function AdminEnrollmentsPage() {
  const toast = useToast();
  const [items,setItems]=useState([]); const [meta,setMeta]=useState(null); const [loading,setLoading]=useState(true);
  const [page,setPage]=useState(1); const [search,setSearch]=useState(''); const [status,setStatus]=useState('');
  const [open,setOpen]=useState(false); const [dropOpen,setDropOpen]=useState(null);
  const [form,setForm]=useState({studentId:'',course:'',batch:'',application:''});
  const [students,setStudents]=useState([]); const [courses,setCourses]=useState([]); const [batches,setBatches]=useState([]); const [saving,setSaving]=useState(false);

  const load=async()=>{ setLoading(true); const r=await clientGet(`/api/admin/enrollments${buildQuery({page,search,status})}`); setLoading(false); if(r.ok){setItems(r.data||[]);setMeta(r.meta);} else toast.error(r.message||'Failed'); };
  useEffect(()=>{load();},[page,search,status]);
  useEffect(()=>{ clientGet('/api/admin/students?limit=100').then(r=>{if(r.ok)setStudents(r.data||[]);}); clientGet('/api/admin/courses?limit=200').then(r=>{if(r.ok)setCourses(r.data||[]);}); clientGet('/api/admin/batches?limit=200').then(r=>{if(r.ok)setBatches(r.data||[]);}); },[]);

  const create=async(e)=>{ e.preventDefault(); setSaving(true); const r=await clientPost('/api/admin/enrollments', form); setSaving(false); if(r.ok){toast.success('Enrollment created'); setOpen(false); load();} else toast.error(r.message||'Failed'); };
  const drop=async()=>{ if(!dropOpen)return; setSaving(true); const r=await clientPatch(`/api/admin/enrollments/${dropOpen._id}/drop`,{}); setSaving(false); if(r.ok){toast.success('Enrollment dropped'); setDropOpen(null); load();} else toast.error(r.message||'Failed'); };

  const columns=[
    {key:'student',header:'Student',render:(r)=>r.student?.name||'—'},
    {key:'course',header:'Course',render:(r)=>r.course?.title||'—'},
    {key:'batch',header:'Batch',render:(r)=>r.batch?.name||'—'},
    {key:'status',header:'Status',render:(r)=><Badge tone={getStatusMeta(ENROLLMENT_STATUSES,r.status).tone}>{humanize(r.status)}</Badge>},
    {key:'enrolledAt',header:'Enrolled',render:(r)=>formatDate(r.enrolledAt)},
    {key:'actions',header:'',render:(r)=> r.status==='active' && <Button size="sm" variant="ghost" onClick={()=>setDropOpen(r)}>Drop</Button>},
  ];

  return (
    <div>
      <PageHeader title="Enrollments" description="Manage active and completed enrollments." action={<Button onClick={()=>setOpen(true)}>New enrollment</Button>} />
      <Card>
        <div className="flex gap-3 p-4 border-b border-slate-100">
          <Input placeholder="Filter…" value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}}/>
          <Select value={status} onChange={(e)=>{setStatus(e.target.value);setPage(1);}}><option value="">All statuses</option>{ENROLLMENT_STATUSES.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</Select>
        </div>
        <div className="p-4">
          <DataTable columns={columns} rows={items} loading={loading} empty={<EmptyState title="No enrollments"/>} />
          {meta && <Pagination meta={meta} onPageChange={setPage}/>}
        </div>
      </Card>
      <Modal open={open} onClose={()=>setOpen(false)} title="Enroll student" footer={<><Button variant="secondary" onClick={()=>setOpen(false)}>Cancel</Button><Button onClick={create} disabled={saving}>{saving?'Saving…':'Enroll'}</Button></>}>
        <div className="space-y-3">
          <Field label="Student"><Select value={form.studentId} onChange={(e)=>setForm({...form,studentId:e.target.value})}><option value="">Select student</option>{students.map(s=><option key={s._id} value={s._id}>{s.name} — {s.email}</option>)}</Select></Field>
          <Field label="Course"><Select value={form.course} onChange={(e)=>setForm({...form,course:e.target.value})}><option value="">Select course</option>{courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}</Select></Field>
          <Field label="Batch (optional)"><Select value={form.batch} onChange={(e)=>setForm({...form,batch:e.target.value})}><option value="">None</option>{batches.filter(b=>!form.course||(b.course?._id||b.course)===form.course).map(b=><option key={b._id} value={b._id}>{b.name}</option>)}</Select></Field>
          <Field label="Application ID (optional)"><Input value={form.application} onChange={(e)=>setForm({...form,application:e.target.value})}/></Field>
        </div>
      </Modal>
      <ConfirmDialog open={!!dropOpen} onClose={()=>setDropOpen(null)} onConfirm={drop} loading={saving} title="Drop this enrollment?" confirmLabel="Drop" />
    </div>
  );
}
