'use client';

import { useEffect, useState } from 'react';
import { clientGet, clientPost } from '@/lib/client';
import { buildQuery, formatDate, humanize } from '@/lib/format';
import { PageHeader } from '@/components/dashboard/Shell';
import { Card, Badge, Button, Field, Input, Select, EmptyState } from '@/components/ui/primitives';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';

const show = (value) => {
  if (value === undefined || value === null || value === '') return '—';
  return value;
};

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-6 py-1 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-700">{value}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </section>
  );
}

function StudentDetailView({ detail }) {
  const { user, profile, applications = [], enrollments = [] } = detail;
  const fullAddress = [
    profile?.address?.line1,
    profile?.address?.line2,
    profile?.address?.city,
    profile?.address?.state,
    profile?.address?.pincode,
    profile?.address?.country,
  ].filter(Boolean).join(', ');

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Badge tone={detail.profileComplete ? 'success' : 'warning'}>{detail.profileComplete ? 'Profile complete' : 'Profile incomplete'}</Badge>
        <Badge tone={user.isActive ? 'success' : 'neutral'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
      </div>

      <Section title="Personal">
        <DetailRow label="Name" value={show(user.name)} />
        <DetailRow label="Email" value={show(user.email)} />
        <DetailRow label="Phone" value={show(user.phone)} />
        <DetailRow label="Alternate phone" value={show(profile?.alternatePhone)} />
        <DetailRow label="WhatsApp" value={show(profile?.whatsapp)} />
        <DetailRow label="Date of birth" value={profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : '—'} />
        <DetailRow label="Gender" value={profile?.gender ? humanize(profile.gender) : '—'} />
        <DetailRow label="Occupation" value={show(profile?.occupation)} />
      </Section>

      <Section title="Address">
        <p className="text-sm text-slate-700">{fullAddress || '—'}</p>
      </Section>

      <Section title="Education">
        <DetailRow label="Qualification" value={show(profile?.qualification)} />
        <DetailRow label="Specialisation" value={show(profile?.specialization)} />
        <DetailRow label="College / school" value={show(profile?.college)} />
        <DetailRow label="Year" value={show(profile?.yearOfStudy)} />
        <DetailRow label="Interested course" value={show(profile?.interestedCourse)} />
        <DetailRow label="Preferred mode" value={profile?.preferredMode ? humanize(profile.preferredMode) : '—'} />
        <DetailRow label="Preferred timing" value={show(profile?.preferredTiming)} />
        <DetailRow label="How they heard" value={show(profile?.source)} />
      </Section>

      <Section title="Guardian">
        <DetailRow label="Name" value={show(profile?.guardian?.name)} />
        <DetailRow label="Relation" value={show(profile?.guardian?.relation)} />
        <DetailRow label="Phone" value={show(profile?.guardian?.phone)} />
      </Section>

      <Section title="Emergency contact">
        <DetailRow label="Name" value={show(profile?.emergencyContact?.name)} />
        <DetailRow label="Relation" value={show(profile?.emergencyContact?.relation)} />
        <DetailRow label="Phone" value={show(profile?.emergencyContact?.phone)} />
      </Section>

      <Section title="Documents">
        {profile?.documents?.length ? (
          <ul className="space-y-1 text-sm">
            {profile.documents.map((doc) => (
              <li key={doc._id} className="flex justify-between gap-4">
                <span>{humanize(doc.type)}{doc.number ? ` · ${doc.number}` : ''}</span>
                <a href={doc.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">View</a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No documents uploaded.</p>
        )}
      </Section>

      <Section title={`Applications (${applications.length})`}>
        {applications.length ? (
          <ul className="space-y-1 text-sm">
            {applications.map((app) => (
              <li key={app._id} className="flex justify-between gap-4">
                <span>{app.course?.title || 'Course'} · {app.referenceNumber}</span>
                <span className="text-slate-500">{humanize(app.status)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No applications yet.</p>
        )}
      </Section>

      <Section title={`Enrollments (${enrollments.length})`}>
        {enrollments.length ? (
          <ul className="space-y-1 text-sm">
            {enrollments.map((en) => (
              <li key={en._id} className="flex justify-between gap-4">
                <span>{en.course?.title || 'Course'}</span>
                <span className="text-slate-500">{humanize(en.status)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Not enrolled in a batch yet.</p>
        )}
      </Section>
    </div>
  );
}

export default function AdminStudentsPage() {
  const toast = useToast();
  const [items,setItems]=useState([]); const [meta,setMeta]=useState(null); const [loading,setLoading]=useState(true);
  const [page,setPage]=useState(1); const [search,setSearch]=useState('');
  const [open,setOpen]=useState(false); const [form,setForm]=useState({name:'',email:'',password:'',role:'student',phone:'',isActive:true});
  const [saving,setSaving]=useState(false);
  const [detail,setDetail]=useState(null); const [detailOpen,setDetailOpen]=useState(false); const [detailLoading,setDetailLoading]=useState(false);

  const load=async()=>{
    setLoading(true);
    const r=await clientGet(`/api/admin/students${buildQuery({page,search})}`); setLoading(false);
    if(r.ok){setItems(r.data||[]);setMeta(r.meta);} else toast.error(r.message||'Failed');
  };
  useEffect(()=>{load();},[page,search]);

  const create=async(e)=>{ e.preventDefault(); setSaving(true); const r=await clientPost('/api/admin/users', form); setSaving(false); if(r.ok){toast.success('Student/user created'); setOpen(false); load();} else toast.error(r.message||'Failed'); };

  const openDetail=async(row)=>{
    setDetailOpen(true); setDetail(null); setDetailLoading(true);
    const r=await clientGet(`/api/admin/students/${row._id}`); setDetailLoading(false);
    if(r.ok) setDetail(r.data); else toast.error(r.message||'Failed');
  };

  const columns=[
    {key:'name',header:'Name'},
    {key:'email',header:'Email'},
    {key:'phone',header:'Phone'},
    {key:'city',header:'City',render:(r)=>r.profile?.address?.city||'—'},
    {key:'qualification',header:'Qualification',render:(r)=>r.profile?.qualification||'—'},
    {key:'profile',header:'Profile',render:(r)=><Badge tone={r.profileComplete?'success':'warning'}>{r.profileComplete?'Complete':'Incomplete'}</Badge>},
    {key:'isActive',header:'Active',render:(r)=><Badge tone={r.isActive?'success':'neutral'}>{r.isActive?'Yes':'No'}</Badge>},
    {key:'createdAt',header:'Joined',render:(r)=>formatDate(r.createdAt)},
  ];

  return (
    <div>
      <PageHeader title="Students & Users" description="Manage student accounts and access. Click a row to see the full profile." action={<Button onClick={()=>setOpen(true)}>Add user</Button>} />
      <Card>
        <div className="flex gap-3 p-4 border-b border-slate-100">
          <Input placeholder="Search name/email" value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}}/>
        </div>
        <div className="p-4">
          <DataTable columns={columns} rows={items} loading={loading} onRowClick={openDetail} empty={<EmptyState title="No users"/>} />
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
              {['admin','staff','trainer','student'].map(r=> <option key={r} value={r}>{humanize(r)}</option>)}
            </Select>
          </Field>
          <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={form.isActive} onChange={(e)=>setForm({...form,isActive:e.target.checked})}/> Active</label>
        </div>
      </Modal>
      <Modal open={detailOpen} onClose={()=>setDetailOpen(false)} title={detail?.user?.name || 'Student profile'}>
        {detailLoading ? <p className="py-6 text-center text-sm text-slate-500">Loading…</p> : detail ? <StudentDetailView detail={detail}/> : null}
      </Modal>
    </div>
  );
}
