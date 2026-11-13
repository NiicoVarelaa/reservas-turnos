import { cn } from '@/lib/utils'

export default function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
  className,
}) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6',
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal">
            {eyebrow}
          </p>
        )}
        <div className="mt-1 flex items-center gap-3">
          {Icon && (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary ring-1 ring-inset ring-primary/10">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{title}</h1>
        </div>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div>
      )}
    </header>
  )
}
