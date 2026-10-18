'use client';

import { useEffect, useState } from 'react';
import { clientGet } from '@/lib/client';
import { buildQuery, formatDate } from '@/lib/format';
import { PageHeader } from '@/components/dashboard/Shell';
import { Card, Button, Field, Input, EmptyState } from '@/components/ui/primitives';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';

export default function AdminNewsletterPage() {
  const toast = useToast();
  const [items,setItems]=useState([]); const [meta,setMeta]=useState(null); const [loading,setLoading]=useState(true);
  const [page,setPage]=useState(1); const [search,setSearch]=useState('');

  const load=async()=>{
    setLoading(true);
    const r=await clientGet(`/api/admin/newsletter/subscribers${buildQuery({page,search})}`);
    setLoading(false);
    if(r.ok){setItems(r.data||[]);setMeta(r.meta);} else toast.error(r.message||'Failed');
  };
  useEffect(()=>{load();},[page,search]);

  const exportCsv=()=>{ window.location.href=`/api/admin/newsletter/subscribers?export=csv`; };

  const columns=[
    {key:'email',header:'Email'},
    {key:'isActive',header:'Active',render:(r)=>r.isActive?'Yes':'No'},
    {key:'createdAt',header:'Subscribed',render:(r)=>formatDate(r.createdAt)},
  ];

  return (
    <div>
      <PageHeader title="Newsletter" description="Manage subscribers." action={<Button variant="secondary" onClick={exportCsv}>Export CSV</Button>} />
      <Card>
        <div className="p-4 border-b border-slate-100">
          <Input placeholder="Search email" value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}}/>
        </div>
        <div className="p-4">
          <DataTable columns={columns} rows={items} loading={loading} empty={<EmptyState title="No subscribers"/>} />
          {meta && <Pagination meta={meta} onPageChange={setPage}/>}
        </div>
      </Card>
    </div>
  );
}
