'use client';

import { Badge } from '@/components/ui/primitives';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { USER_ROLES } from '@/lib/constants';
import { humanize } from '@/lib/format';

export default function AdminUsersPage() {
  const fields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password', type: 'password', hint: 'Leave blank to keep the current password when editing.', omitEmpty: true },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'role', label: 'Role', type: 'select', options: USER_ROLES },
    { name: 'isActive', label: 'Active', type: 'checkbox' },
  ];

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (r) => <Badge tone={['super_admin', 'admin'].includes(r.role) ? 'brand' : 'neutral'}>{humanize(r.role)}</Badge> },
    { key: 'isActive', header: 'Active', render: (r) => <Badge tone={r.isActive ? 'success' : 'neutral'}>{r.isActive ? 'Yes' : 'No'}</Badge> },
  ];

  return (
    <ResourceManager
      title="Users"
      description="Administrative accounts. Only a Super Admin can manage admin roles."
      endpoint="/api/admin/users"
      itemLabel="user"
      columns={columns}
      fields={fields}
      filters={[{ name: 'role', label: 'Role', options: USER_ROLES }]}
      defaultValues={{ role: 'student', isActive: true }}
      createLabel="New user"
    />
  );
}
