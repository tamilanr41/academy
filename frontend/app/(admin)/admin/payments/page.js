'use client';

import { useEffect, useState } from 'react';
import { clientGet } from '@/lib/client';
import { buildQuery, formatCurrency, formatDate, humanize } from '@/lib/format';
import { PAYMENT_STATUSES, getStatusMeta } from '@/lib/constants';
import { PageHeader } from '@/components/dashboard/Shell';
import { Card, Badge, Button, Field, Input, Select, Textarea, EmptyState } from '@/components/ui/primitives';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';

export default function AdminPaymentsPage() {
  const toast = useToast();
  const [items,setItems]=useState([]); const [meta,setMeta]=useState(null); const [loading,setLoading]=useState(true);
  const [page,setPage]=useState(1); const [status,setStatus]=useState('');
  const [stats,setStats]=useState(null);
  const [open,setOpen]=useState(false);
  const [students,setStudents]=useState([]); const [courses,setCourses]=useState([]); const [form,setForm]=useState({studentId:'',course:'',batch:'',amount:'',notes:''});
  const [saving,setSaving]=useState(false);

  const load=async()=>{ setLoading(true); const r=await clientGet(`/api/admin/payments${buildQuery({page,status})}`); setLoading(false); if(r.ok){setItems(r.data||[]);setMeta(r.meta);} };
  const loadStats=async()=>{ const r=await clientGet('/api/admin/payments/stats'); if(r.ok)setStats(r.data); };

  useEffect(()=>{load();loadStats();},[page,status]);
  useEffect(()=>{ clientGet('/api/admin/students?limit=100').then(r=>{if(r.ok)setStudents(r.data||[]);}); clientGet('/api/admin/courses?limit=200').then(r=>{if(r.ok)setCourses(r.data||[]);}); },[]);

  const recordOffline=async(e)=>{ e.preventDefault(); setSaving(true); const r=await fetch('/api/admin/payments/offline',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,amount:form.amount?Number(form.amount):undefined})}); const j=await r.json().catch(()=>({})); setSaving(false); if(r.ok){toast.success(j.message||'Recorded'); setOpen(false); load();loadStats();} else toast.error(j.message||'Failed'); };

  const columns=[
    {key:'receiptNumber',header:'Receipt'},
    {key:'student',header:'Student',render:(r)=>r.student?.name||'—'},
    {key:'course',header:'Course',render:(r)=>r.course?.title||'—'},
    {key:'amount',header:'Amount',render:(r)=>formatCurrency(r.amount,r.currency)},
    {key:'status',header:'Status',render:(r)=><Badge tone={getStatusMeta(PAYMENT_STATUSES,r.status).tone}>{humanize(r.status)}</Badge>},
    {key:'paidAt',header:'Date',render:(r)=>formatDate(r.paidAt||r.createdAt)},
  ];

  return (
    <div>
      <PageHeader title="Payments" description="Track transactions and record offline payments." action={<Button onClick={()=>setOpen(true)}>Record offline</Button>} />
      {stats && (
        <div className="mb-4 flex flex-wrap gap-2">
          {(stats.byStatus||[]).map(s=> <Badge key={s.status} tone={getStatusMeta(PAYMENT_STATUSES,s.status).tone}>{humanize(s.status)}: {formatCurrency(s.total)}</Badge>)}
          <Badge tone="warning">Refunds: {formatCurrency(stats.refunds?.total||0)}</Badge>
        </div>
      )}
      <Card>
        <div className="flex gap-3 p-4 border-b border-slate-100">
          <Select value={status} onChange={(e)=>{setStatus(e.target.value);setPage(1);}}><option value="">All statuses</option>{PAYMENT_STATUSES.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</Select>
        </div>
        <div className="p-4">
          <DataTable columns={columns} rows={items} loading={loading} empty={<EmptyState title="No payments"/>} />
          {meta && <Pagination meta={meta} onPageChange={setPage}/>}
        </div>
      </Card>
      <Modal open={open} onClose={()=>setOpen(false)} title="Record offline payment" footer={<><Button variant="secondary" onClick={()=>setOpen(false)}>Cancel</Button><Button onClick={recordOffline} disabled={saving}>{saving?'Saving…':'Record'}</Button></>}>
        <div className="space-y-3">
          <Field label="Student"><Select value={form.studentId} onChange={(e)=>setForm({...form,studentId:e.target.value})}><option value="">Select</option>{students.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}</Select></Field>
          <Field label="Course"><Select value={form.course} onChange={(e)=>setForm({...form,course:e.target.value})}><option value="">Select</option>{courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}</Select></Field>
          <Field label="Amount (leave blank to use course fee)"><Input type="number" value={form.amount} onChange={(e)=>setForm({...form,amount:e.target.value})}/></Field>
          <Field label="Notes"><Textarea rows={2} value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})}/></Field>
        </div>
      </Modal>
    </div>
  );
}
