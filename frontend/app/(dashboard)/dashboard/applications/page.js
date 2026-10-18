'use client';

import { useEffect, useState } from 'react';
import { clientGet } from '@/lib/client';
import { buildQuery, formatDate, humanize } from '@/lib/format';
import { PageHeader } from '@/components/dashboard/Shell';
import { Card, Badge, Button, EmptyState } from '@/components/ui/primitives';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import Link from 'next/link';

export default function MyApplications() {
  const [items,setItems]=useState([]); const [meta,setMeta]=useState(null); const [loading,setLoading]=useState(true); const [page,setPage]=useState(1);
  const load=async()=>{ setLoading(true); const r=await clientGet(`/api/student/applications/my${buildQuery({page})}`); setLoading(false); if(r.ok){setItems(r.data||[]);setMeta(r.meta);} };
  useEffect(()=>{load();},[page]);
  const columns=[
    {key:'referenceNumber',header:'Ref'},
    {key:'course',header:'Course',render:(r)=>r.course?.title||'—'},
    {key:'status',header:'Status',render:(r)=><Badge>{humanize(r.status)}</Badge>},
    {key:'createdAt',header:'Applied',render:(r)=>formatDate(r.createdAt)},
    {key:'actions',header:'',render:(r)=><Link href="/dashboard/applications" className="text-sm text-brand-600">View</Link>},
  ];
  return (
    <div>
      <PageHeader title="My Applications" description="Track your submitted applications." action={<Button href="/apply">New application</Button>} />
      <Card className="p-4">
        <DataTable columns={columns} rows={items} loading={loading} empty={<EmptyState title="No applications" action={<Button href="/apply">Apply now</Button>}/>} />
        {meta && <Pagination meta={meta} onPageChange={setPage}/>}
      </Card>
    </div>
  );
}
