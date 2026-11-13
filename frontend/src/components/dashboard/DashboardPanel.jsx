import { cn } from '@/lib/utils'

export default function DashboardPanel({
  title,
  description,
  icon: Icon,
  actions,
  children,
  footer,
  className,
  bodyClassName,
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm',
        className
      )}
    >
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="text-base font-semibold tracking-tight">{title}</h2>
              )}
              {description && (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>

          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className={cn('p-5 sm:p-6', bodyClassName)}>{children}</div>

      {footer && (
        <div className="border-t border-border/70 bg-muted/20 px-5 py-4 sm:px-6">{footer}</div>
      )}
    </section>
  )
}
