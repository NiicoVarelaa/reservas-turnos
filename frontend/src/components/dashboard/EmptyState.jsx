import { cn } from '@/lib/utils'

const TONES = {
  default: {
    wrapper: 'border-border bg-muted/20',
    icon: 'bg-background text-muted-foreground ring-border',
  },
  destructive: {
    wrapper: 'border-destructive/25 bg-destructive/5',
    icon: 'bg-destructive/10 text-destructive ring-destructive/20',
  },
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = 'default',
  className,
}) {
  const styles = TONES[tone] || TONES.default

  return (
    <div
      role={tone === 'destructive' ? 'alert' : undefined}
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-14 text-center',
        styles.wrapper,
        className
      )}
    >
      {Icon && (
        <span
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-inset',
            styles.icon
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <h3 className="mt-4 text-base font-semibold text-balance">{title}</h3>
      {description && (
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">{action}</div>
      )}
    </div>
  )
}
