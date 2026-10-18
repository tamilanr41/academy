'use client';

import { useEffect, useState } from 'react';
import { clientGet } from '@/lib/client';
import { buildQuery, formatDate, humanize } from '@/lib/format';
import { PageHeader } from '@/components/dashboard/Shell';
import { Card, Badge, Input, Select, EmptyState } from '@/components/ui/primitives';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';

export default function AdminAuditPage() {
  const [items,setItems]=useState([]); const [meta,setMeta]=useState(null); const [loading,setLoading]=useState(true);
  const [page,setPage]=useState(1); const [action,setAction]=useState('');

  const load=async()=>{
    setLoading(true);
    const r=await clientGet(`/api/admin/audit-logs${buildQuery({page,action})}`);
    setLoading(false);
    if(r.ok){setItems(r.data||[]);setMeta(r.meta);}
  };
  useEffect(()=>{load();},[page,action]);

  const columns=[
    {key:'action',header:'Action',render:(r)=>humanize(r.action||'')},
    {key:'entity',header:'Entity'},
    {key:'actor',header:'Actor',render:(r)=>r.actor?.name||'System'},
    {key:'summary',header:'Summary',render:(r)=><span className="line-clamp-1 max-w-sm">{r.summary}</span>},
    {key:'createdAt',header:'Date',render:(r)=>formatDate(r.createdAt,true)},
  ];

  return (
    <div>
      <PageHeader title="Audit Logs" description="System activity trail." />
      <Card>
        <div className="flex gap-3 p-4 border-b border-slate-100">
          <Input placeholder="Action filter" value={action} onChange={(e)=>{setAction(e.target.value);setPage(1);}}/>
        </div>
        <div className="p-4">
          <DataTable columns={columns} rows={items} loading={loading} empty={<EmptyState title="No audit logs"/>} />
          {meta && <Pagination meta={meta} onPageChange={setPage}/>
          }
        </div>
      </Card>
    </div>
  );
}
