'use client';

import { useEffect, useState } from 'react';
import { clientGet, clientPatch, clientPost } from '@/lib/client';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/dashboard/Shell';
import { Card, Button, EmptyState } from '@/components/ui/primitives';
import { DataTable } from '@/components/ui/DataTable';

export default function MyNotifications() {
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true);
  const load=async()=>{ setLoading(true); const r=await clientGet('/api/student/notifications'); setLoading(false); if(r.ok)setItems(r.data||[]); };
  useEffect(()=>{load();},[]);
  const markRead=async(id)=>{ await clientPatch(`/api/student/notifications/${id}/read`,{}); load(); };
  const markAll=async()=>{ await clientPost('/api/student/notifications/read-all',{}); load(); };
  const columns=[
    {key:'title',header:'Title'},
    {key:'message',header:'Message',render:(r)=><span className="line-clamp-1 max-w-sm">{r.message}</span>},
    {key:'createdAt',header:'Date',render:(r)=>formatDate(r.createdAt)},
    {key:'actions',header:'',render:(r)=>!r.isRead && <Button size="sm" variant="ghost" onClick={()=>markRead(r._id)}>Mark read</Button>},
  ];
  return (
    <div>
      <PageHeader title="Notifications" description="Updates and alerts." action={<Button variant="secondary" onClick={markAll}>Mark all read</Button>} />
      <Card className="p-4">
        <DataTable columns={columns} rows={items} loading={loading} empty={<EmptyState title="No notifications"/>} />
      </Card>
    </div>
  );
}
