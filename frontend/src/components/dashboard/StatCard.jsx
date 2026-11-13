import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const TONES = {
  primary: 'bg-primary/10 text-primary ring-primary/15',
  teal: 'bg-teal/10 text-teal ring-teal/20',
  amber: 'bg-amber-100 text-amber-700 ring-amber-200',
  rose: 'bg-rose-100 text-rose-700 ring-rose-200',
  muted: 'bg-muted text-muted-foreground ring-border',
}

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'primary',
  loading = false,
  className,
}) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-border/70 bg-card p-5 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-3 h-8 w-20" />
          ) : (
            <p className="mt-2 truncate text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
          )}
          {hint && (
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>
          )}
        </div>

        {Icon && (
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
              TONES[tone] || TONES.primary
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  )
}
