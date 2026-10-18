'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, RotateCw, X } from 'lucide-react';
import { clientGet, clientPost, clientPatch, clientDelete } from '@/lib/client';
import { buildQuery, cn } from '@/lib/format';
import { Button, Input, Select, Textarea, Checkbox, Field, EmptyState, Card } from '@/components/ui/primitives';
import { DataTable } from '@/components/ui/DataTable';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/dashboard/Shell';

/**
 * Config-driven CRUD screen. Each admin resource supplies its columns, form
 * fields and endpoint; everything else (pagination, search, filters, create,
 * edit, delete, validation errors) is handled here against the real API.
 */
export function ResourceManager({
  title,
  description,
  endpoint,
  columns,
  fields = [],
  searchable = true,
  searchPlaceholder = 'Search…',
  filters = [],
  rowKey = '_id',
  canCreate = true,
  canEdit = true,
  canDelete = true,
  createLabel = 'New',
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  defaultValues = {},
  toForm,
  fromForm,
  itemLabel = 'item',
  headerExtra,
  onRefetchReady,
}) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterValues, setFilterValues] = useState({});

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [removing, setRemoving] = useState(false);

  const query = useMemo(
    () => buildQuery({ page, search, ...filterValues }),
    [page, search, filterValues]
  );

  const load = useCallback(async () => {
    setLoading(true);
    const result = await clientGet(`${endpoint}${query}`);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.message || 'Failed to load data');
      setItems([]);
      setMeta(null);
      return;
    }
    if (Array.isArray(result.data)) {
      setItems(result.data);
      setMeta(null);
    } else {
      setItems(result.data || []);
      setMeta(result.meta);
    }
  }, [endpoint, query, toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    onRefetchReady?.(load);
  }, [load, onRefetchReady]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const openCreate = () => {
    setEditing(null);
    setValues({ ...defaultValues });
    setErrors({});
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setValues(toForm ? toForm(record) : { ...record });
    setErrors({});
    setOpen(true);
  };

  const setValue = (name, value) => setValues((current) => ({ ...current, [name]: value }));

  const normalize = (raw) => {
    const payload = {};
    for (const field of fields) {
      const name = field.name;
      const value = raw[name];
      switch (field.type) {
        case 'tags':
          payload[name] = Array.isArray(value)
            ? value
            : String(value || '')
                .split(/[\n,]/)
                .map((v) => v.trim())
                .filter(Boolean);
          break;
        case 'multiselect':
          payload[name] = Array.isArray(value) ? value : [];
          break;
        case 'checkbox':
          payload[name] = Boolean(value);
          break;
        case 'number': {
          if (value === '' || value === undefined || value === null) {
            if (field.required) payload[name] = value;
            break;
          }
          payload[name] = Number(value);
          break;
        }
        case 'file':
          if (value !== undefined) payload[name] = value;
          break;
        case 'repeater':
          payload[name] = Array.isArray(value) ? value : [];
          break;
        case 'select':
          if (value !== '' && value !== undefined) payload[name] = value;
          break;
        default:
          if (value === undefined) break;
          if (field.omitEmpty && (value === '' || value === null)) break;
          payload[name] = value;
      }
    }
    return fromForm ? fromForm(payload, editing) : payload;
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = normalize(values);
    const result = editing
      ? await clientPatch(`${endpoint}/${editing[rowKey]}`, payload)
      : await clientPost(endpoint, payload);
    setSaving(false);

    if (result.ok) {
      toast.success(result.message || `${itemLabel} saved`);
      setOpen(false);
      load();
      return;
    }
    if (result.errors?.length) {
      setErrors(Object.fromEntries(result.errors.map((error) => [error.field, error.message])));
      toast.error('Please fix the highlighted fields');
    } else {
      toast.error(result.message || 'Save failed');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    const result = await clientDelete(`${endpoint}/${deleting[rowKey]}`);
    setRemoving(false);
    if (result.ok) {
      toast.success(result.message || `${itemLabel} deleted`);
      setDeleting(null);
      load();
    } else {
      toast.error(result.message || 'Delete failed');
    }
  };

  const tableColumns = [
    ...columns,
    ...(canEdit || canDelete
      ? [
          {
            key: '__actions',
            header: '',
            headClassName: 'text-right',
            className: 'text-right',
            render: (row) => (
              <div className="flex items-center justify-end gap-1">
                {canEdit && (
                  <button type="button" onClick={() => openEdit(row)} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-brand-700" aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                {canDelete && (
                  <button type="button" onClick={() => setDeleting(row)} className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        action={
          <div className="flex items-center gap-2">
            {headerExtra}
            <Button variant="secondary" size="sm" onClick={load}>
              <RotateCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
            </Button>
            {canCreate && (
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" /> {createLabel}
              </Button>
            )}
          </div>
        }
      />

      <Card>
        {(searchable || filters.length > 0) && (
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
            {searchable && (
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={searchPlaceholder} className="pl-9" />
              </div>
            )}
            {filters.map((filter) => (
              <Select
                key={filter.name}
                value={filterValues[filter.name] || ''}
                onChange={(e) => {
                  setFilterValues((current) => ({ ...current, [filter.name]: e.target.value }));
                  setPage(1);
                }}
                className="min-w-[160px]"
              >
                <option value="">{filter.label}: All</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            ))}
          </div>
        )}

        <div className="p-4">
          <DataTable
            columns={tableColumns}
            rows={items}
            loading={loading}
            getRowKey={(row) => row[rowKey]}
            empty={
              <EmptyState
                title={emptyTitle}
                description={emptyDescription || `No ${itemLabel}s found.`}
                action={canCreate ? <Button onClick={openCreate}><Plus className="h-4 w-4" /> {createLabel}</Button> : undefined}
              />
            }
          />
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${itemLabel}` : `New ${itemLabel}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="resource-form" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : `Create ${itemLabel}`}
            </Button>
          </>
        }
      >
        <form id="resource-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
          {fields.map((field) => (
            <div key={field.name} className={field.span === 2 ? 'sm:col-span-2' : ''}>
              <FieldRenderer field={field} value={values[field.name]} onChange={(value) => setValue(field.name, value)} error={errors[field.name]} />
            </div>
          ))}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={removing}
        title={`Delete this ${itemLabel}?`}
        confirmLabel="Delete"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Field renderer                                                            */
/* -------------------------------------------------------------------------- */

function FieldRenderer({ field, value, onChange, error }) {
  const { type = 'text', label, hint, required, placeholder, options = [], rows = 4, subfields = [], aspect } = field;

  if (type === 'checkbox') {
    return (
      <div className="pt-6">
        <Checkbox checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} label={label} />
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
      </div>
    );
  }

  if (type === 'file') {
    return (
      <div className="sm:col-span-2">
        <ImageUploader value={value} onChange={onChange} label={label} folder={field.folder || 'academy'} aspect={aspect || 'aspect-video'} />
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
      </div>
    );
  }

  if (type === 'multiselect') {
    const selected = Array.isArray(value) ? value : [];
    return (
      <Field label={label} error={error} hint={hint} required={required}>
        <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-lg border border-slate-200 p-3">
          {options.map((option) => (
            <Checkbox
              key={option.value}
              label={option.label}
              checked={selected.includes(option.value)}
              onChange={(e) => {
                const next = e.target.checked ? [...selected, option.value] : selected.filter((v) => v !== option.value);
                onChange(next);
              }}
            />
          ))}
          {!options.length && <p className="text-xs text-slate-400">No options available.</p>}
        </div>
      </Field>
    );
  }

  if (type === 'repeater') {
    const rows = Array.isArray(value) ? value : [];
    const blank = Object.fromEntries(subfields.map((s) => [s.name, s.default ?? '']));
    return (
      <Field label={label} error={error} hint={hint}>
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div key={index} className="rounded-xl border border-slate-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">#{index + 1}</span>
                <button type="button" onClick={() => onChange(rows.filter((_, i) => i !== index))} className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove row">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {subfields.map((sub) => (
                  <div key={sub.name} className={sub.span === 2 ? 'sm:col-span-2' : ''}>
                    <span className="label">{sub.label}</span>
                    {sub.type === 'textarea' ? (
                      <Textarea rows={2} value={row[sub.name] ?? ''} onChange={(e) => onChange(rows.map((r, i) => (i === index ? { ...r, [sub.name]: e.target.value } : r)))} placeholder={sub.placeholder} />
                    ) : (
                      <Input value={row[sub.name] ?? ''} onChange={(e) => onChange(rows.map((r, i) => (i === index ? { ...r, [sub.name]: e.target.value } : r)))} placeholder={sub.placeholder} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...rows, { ...blank }])}>
            <Plus className="h-4 w-4" /> Add row
          </Button>
        </div>
      </Field>
    );
  }

  return (
    <Field label={label} error={error} hint={hint} required={required}>
      {type === 'textarea' ? (
        <Textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} error={error} />
      ) : type === 'select' ? (
        <Select value={value ?? ''} onChange={(e) => onChange(e.target.value)} error={error}>
          <option value="">{placeholder || 'Select…'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ) : type === 'tags' ? (
        <Textarea rows={3} value={Array.isArray(value) ? value.join('\n') : value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || 'One per line'} />
      ) : (
        <Input
          type={type === 'number' ? 'number' : type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          error={error}
          step={type === 'number' ? 'any' : undefined}
        />
      )}
    </Field>
  );
}
