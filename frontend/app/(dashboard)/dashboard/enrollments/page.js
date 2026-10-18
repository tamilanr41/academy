'use client';

import { useEffect, useState } from 'react';
import { clientGet, clientPatch } from '@/lib/client';
import { buildQuery, formatDate } from '@/lib/format';
import { PageHeader } from '@/components/dashboard/Shell';
import { Card, Badge, Button, EmptyState, Field, Input, Select } from '@/components/ui/primitives';
import { DataTable } from '@/components/ui/DataTable';

export default function MyEnrollments() {
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true);
  const load=async()=>{ setLoading(true); const r=await clientGet('/api/student/enrollments/my'); setLoading(false); if(r.ok)setItems(r.data||[]); };
  useEffect(()=>{load();},[]);
  const markComplete=async(id,mod)=>{
    await clientPatch(`/api/student/enrollments/${id}/progress`, { moduleTitle: mod, completed: true });
    load();
  };
  const columns=[
    {key:'course',header:'Course',render:(r)=>r.course?.title||'—'},
    {key:'batch',header:'Batch',render:(r)=>r.batch?.name||'—'},
    {key:'status',header:'Status',render:(r)=><Badge>{r.status}</Badge>},
    {key:'enrolledAt',header:'Enrolled',render:(r)=>formatDate(r.enrolledAt)},
    {key:'progress',header:'Progress',render:(r)=>`${r.progressPercent||0}%`},
  ];
  return (
    <div>
      <PageHeader title="My Courses" description="Your active and completed enrollments." />
      <Card className="p-4">
        <DataTable columns={columns} rows={items} loading={loading} empty={<EmptyState title="No enrollments"/>} />
      </Card>
    </div>
  );
}
