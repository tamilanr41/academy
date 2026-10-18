import Link from 'next/link';
import { cn } from '@/lib/format';

/* -------------------------------------------------------------------------- */
/*  Button                                                                     */
/* -------------------------------------------------------------------------- */

const VARIANTS = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  ghost: 'btn btn-ghost',
  danger: 'btn btn-danger',
};

export function Button({ variant = 'primary', size, className, href, children, type = 'button', ...props }) {
  const classes = cn(VARIANTS[variant] || VARIANTS.primary, size === 'sm' && 'btn-sm', className);

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Badge / pills                                                              */
/* -------------------------------------------------------------------------- */

const TONES = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
};

export function Badge({ tone = 'neutral', className, children }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] ring-1 ring-inset', TONES[tone] || TONES.neutral, className)}>
      {children}
    </span>
  );
}

export function StatusPill({ meta }) {
  return <Badge tone={meta?.tone || 'neutral'}>{meta?.label || '—'}</Badge>;
}

/* -------------------------------------------------------------------------- */
/*  Card                                                                       */
/* -------------------------------------------------------------------------- */

export function Card({ className, children, ...props }) {
  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4', className)}>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

/* -------------------------------------------------------------------------- */
/*  Feedback                                                                   */
/* -------------------------------------------------------------------------- */

export function Spinner({ className }) {
  return (
    <span
      className={cn('inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600', className)}
      role="status"
      aria-label="Loading"
    />
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Avatars & stats                                                            */
/* -------------------------------------------------------------------------- */

export function Avatar({ src, name = '', size = 40, className }) {
  const dimension = { width: size, height: size };
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} style={dimension} className={cn('rounded-full object-cover', className)} />;
  }
  const letters = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return (
    <span
      style={dimension}
      className={cn('flex items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700', className)}
    >
      {letters || '?'}
    </span>
  );
}

export function StatCard({ label, value, icon: Icon, hint, tone = 'brand' }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', TONES[tone] || TONES.brand)}>
            <Icon className="h-4.5 w-4.5" />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Form fields                                                                */
/* -------------------------------------------------------------------------- */

export function Field({ label, htmlFor, error, hint, required, children, className }) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="label" htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function Input({ className, error, ...props }) {
  return <input className={cn('input', error && 'border-red-400 focus:border-red-500', className)} {...props} />;
}

export function Textarea({ className, error, rows = 4, ...props }) {
  return <textarea rows={rows} className={cn('input resize-y', error && 'border-red-400', className)} {...props} />;
}

export function Select({ className, error, children, ...props }) {
  return (
    <select className={cn('input appearance-none bg-white pr-9', error && 'border-red-400', className)} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({ label, className, ...props }) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-2 text-sm text-slate-700', className)}>
      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" {...props} />
      {label}
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section heading                                                            */
/* -------------------------------------------------------------------------- */

export function SectionHeading({ eyebrow, index, title, description, align = 'center', className }) {
  const hasMeta = Boolean(eyebrow || index);
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      {hasMeta && (
        <div className={cn('flex items-center gap-3', align === 'center' && 'justify-center')}>
          {index && <span className="index-num">{index}</span>}
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <span className={cn('rule', align === 'left' ? 'flex-1' : 'w-16')} aria-hidden />
        </div>
      )}
      <h2 className="section-title mt-3 text-balance">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-slate-600">{description}</p>}
    </div>
  );
}
