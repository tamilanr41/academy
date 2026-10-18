'use client';

import { useEffect, useState } from 'react';
import { clientGet, clientPatch, clientPost } from '@/lib/client';
import { PageHeader } from '@/components/dashboard/Shell';
import { Card, CardHeader, CardBody, Button, Field, Input, Textarea } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';

export default function MyProfile() {
  const toast = useToast();
  const [me,setMe]=useState(null);
  const [profile,setProfile]=useState({name:'',phone:''});
  const [pwd,setPwd]=useState({currentPassword:'',newPassword:''});
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    clientGet('/api/auth/me',{auth:true}).then(r=>{ if(r.ok){setMe(r.data.user); setProfile({name:r.data.user.name||'',phone:r.data.user.phone||''});}});
  },[]);

  const update=async()=>{ setLoading(true); const r=await clientPatch('/api/auth/profile', profile); setLoading(false); if(r.ok){toast.success('Profile updated');} else toast.error(r.message||'Failed'); };
  const changePwd=async()=>{ setLoading(true); const r=await clientPost('/api/auth/change-password', pwd); setLoading(false); if(r.ok){toast.success('Password updated'); setPwd({currentPassword:'',newPassword:''});} else toast.error(r.message||'Failed'); };

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account details." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Basic info" />
          <CardBody className="space-y-3">
            <Field label="Name"><Input value={profile.name} onChange={(e)=>setProfile({...profile,name:e.target.value})}/></Field>
            <Field label="Phone"><Input value={profile.phone} onChange={(e)=>setProfile({...profile,phone:e.target.value})}/></Field>
            <Button onClick={update} disabled={loading}>Save profile</Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Change password" />
          <CardBody className="space-y-3">
            <Field label="Current password"><Input type="password" value={pwd.currentPassword} onChange={(e)=>setPwd({...pwd,currentPassword:e.target.value})}/></Field>
            <Field label="New password"><Input type="password" value={pwd.newPassword} onChange={(e)=>setPwd({...pwd,newPassword:e.target.value})}/></Field>
            <Button variant="secondary" onClick={changePwd} disabled={loading}>Update password</Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
