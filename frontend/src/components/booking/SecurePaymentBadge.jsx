import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

function VisaIcon({ className }) {
  return (
    <svg viewBox="0 0 48 32" className={cn('h-6 w-auto', className)} aria-label="Visa">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial, sans-serif">VISA</text>
    </svg>
  )
}

function MastercardIcon({ className }) {
  return (
    <svg viewBox="0 0 48 32" className={cn('h-6 w-auto', className)} aria-label="Mastercard">
      <rect width="48" height="32" rx="4" fill="#252525" />
      <circle cx="19" cy="16" r="8" fill="#EB001B" />
      <circle cx="29" cy="16" r="8" fill="#F79E1B" />
      <path d="M24 10.5a8 8 0 0 1 0 11" fill="#FF5F00" />
    </svg>
  )
}

export default function SecurePaymentBadge({ className }) {
  return (
    <div className={cn('flex items-center justify-center gap-3 text-xs text-muted-foreground', className)}>
      <div className="flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-[#11b7c1]" />
        <span>Pago seguro con Stripe</span>
      </div>
      <div className="flex items-center gap-1.5">
        <VisaIcon className="h-5" />
        <MastercardIcon className="h-5" />
      </div>
    </div>
  )
}