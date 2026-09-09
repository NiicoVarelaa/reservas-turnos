import { Button } from '@/components/ui/button'
import ResponsiveModal from '@/components/ui/responsive-modal'

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmVariant = 'destructive',
  loading = false,
  loadingLabel = 'Procesando...',
  onConfirm,
  onCancel
}) {
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
        <Button
          variant="ghost"
          onClick={() => {
            onOpenChange(false)
            onCancel?.()
          }}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
          {loading ? loadingLabel : confirmLabel}
        </Button>
      </div>
    </ResponsiveModal>
  )
}