'use client';

import { useEffect, useState } from 'react';
import { clientGet, clientPost, clientPatch, clientDelete } from '@/lib/client';
import { buildQuery, formatDate, humanize } from '@/lib/format';
import { PageHeader } from '@/components/dashboard/Shell';
import { Card, Badge, Button, Field, Input, Select, EmptyState } from '@/components/ui/primitives';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';

export default function AdminStudentsPage() {
  const toast = useToast();
  const [items,setItems]=useState([]); const [meta,setMeta]=useState(null); const [loading,setLoading]=useState(true);
  const [page,setPage]=useState(1); const [search,setSearch]=useState('');
  const [open,setOpen]=useState(false); const [form,setForm]=useState({name:'',email:'',password:'',role:'student',phone:'',isActive:true});
  const [saving,setSaving]=useState(false);

  const load=async()=>{
    setLoading(true);
    const r=await clientGet(`/api/admin/students${buildQuery({page,search})}`); setLoading(false);
    if(r.ok){setItems(r.data||[]);setMeta(r.meta);} else toast.error(r.message||'Failed');
  };
  useEffect(()=>{load();},[page,search]);

  const create=async(e)=>{ e.preventDefault(); setSaving(true); const r=await clientPost('/api/admin/users', form); setSaving(false); if(r.ok){toast.success('Student/user created'); setOpen(false); load();} else toast.error(r.message||'Failed'); };

  const columns=[
    {key:'name',header:'Name'},
    {key:'email',header:'Email'},
    {key:'phone',header:'Phone'},
    {key:'role',header:'Role',render:(r)=>humanize(r.role)},
    {key:'isActive',header:'Active',render:(r)=><Badge tone={r.isActive?'success':'neutral'}>{r.isActive?'Yes':'No'}</Badge>},
    {key:'createdAt',header:'Joined',render:(r)=>formatDate(r.createdAt)},
  ];

  return (
    <div>
      <PageHeader title="Students & Users" description="Manage student accounts and access." action={<Button onClick={()=>setOpen(true)}>Add user</Button>} />
      <Card>
        <div className="flex gap-3 p-4 border-b border-slate-100">
          <Input placeholder="Search name/email" value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}}/>
        </div>
        <div className="p-4">
          <DataTable columns={columns} rows={items} loading={loading} empty={<EmptyState title="No users"/>} />
          {meta && <Pagination meta={meta} onPageChange={setPage}/>}
        </div>
      </Card>
      <Modal open={open} onClose={()=>setOpen(false)} title="Create user" footer={<><Button variant="secondary" onClick={()=>setOpen(false)}>Cancel</Button><Button onClick={create} disabled={saving}>{saving?'Saving…':'Create'}</Button></>}>
        <div className="space-y-3">
          <Field label="Name"><Input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/></Field>
          <Field label="Password"><Input type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})}/></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/></Field>
          <Field label="Role">
            <Select value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}>
              {['super_admin','admin','staff','trainer','student'].map(r=> <option key={r} value={r}>{humanize(r)}</option>)}
            </Select>
          </Field>
          <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={form.isActive} onChange={(e)=>setForm({...form,isActive:e.target.checked})}/> Active</label>
        </div>
      </Modal>
    </div>
  );
}
