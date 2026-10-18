'use client';

import { useEffect, useState } from 'react';
import { clientGet } from '@/lib/client';
import { formatCurrency, formatDate, humanize } from '@/lib/format';
import { PageHeader } from '@/components/dashboard/Shell';
import { Card, Badge, Button, EmptyState } from '@/components/ui/primitives';
import { DataTable } from '@/components/ui/DataTable';

export default function MyPayments() {
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true);
  const load=async()=>{ setLoading(true); const r=await clientGet('/api/student/payments/my'); setLoading(false); if(r.ok)setItems(r.data||[]); };
  useEffect(()=>{load();},[]);
  const columns=[
    {key:'receiptNumber',header:'Receipt'},
    {key:'course',header:'Course',render:(r)=>r.course?.title||'—'},
    {key:'amount',header:'Amount',render:(r)=>formatCurrency(r.amount,r.currency)},
    {key:'status',header:'Status',render:(r)=><Badge>{humanize(r.status)}</Badge>},
    {key:'paidAt',header:'Date',render:(r)=>formatDate(r.paidAt||r.createdAt)},
  ];
  return (
    <div>
      <PageHeader title="My Payments" description="Invoices and receipts for your courses." />
      <Card className="p-4">
        <DataTable columns={columns} rows={items} loading={loading} empty={<EmptyState title="No payments"/>} />
      </Card>
    </div>
  );
}
