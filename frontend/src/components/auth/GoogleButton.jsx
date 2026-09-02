import { useState } from 'react'
import { supabaseClient, isGoogleEnabled } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" className="shrink-0" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
)

export default function GoogleButton({ role = 'client', label = 'Continuar con Google', className }) {
  const [loading, setLoading] = useState(false)

  const redirectTo = `${window.location.origin}/auth/callback`

  const handleClick = async () => {
    if (!isGoogleEnabled()) {
      toast({
        title: 'Google no configurado',
        description: 'El inicio con Google no está disponible en este momento.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      sessionStorage.setItem('sb-google-role', role)
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      })

      if (error) throw error
    } catch (err) {
      console.error('Google sign-in error:', err)
      toast({
        title: 'Error al iniciar con Google',
        description: err.message || 'No se pudo conectar con Google, intentá de nuevo.',
        variant: 'destructive'
      })
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={loading}
      className={`w-full h-11 rounded-xl font-medium text-foreground border-border hover:bg-muted/50 ${className || ''}`}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
      ) : (
        <GoogleIcon />
      )}
      {label}
    </Button>
  )
}
