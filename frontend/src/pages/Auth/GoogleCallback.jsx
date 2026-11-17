import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabaseClient, isGoogleEnabled } from '@/lib/supabaseClient'
import { useGoogleLogin } from '@/hooks/useAuth'
import AuthLayout from '@/components/auth/AuthLayout'
import { CalendarCheck, Loader2, ShieldCheck, UserCheck } from 'lucide-react'

const FEATURES = [
  {
    icon: UserCheck,
    title: 'Verificamos tu identidad',
    text: 'Usamos la sesión segura que devuelve Google.',
  },
  {
    icon: ShieldCheck,
    title: 'Sin contraseñas nuevas',
    text: 'Tu cuenta queda vinculada de forma segura.',
  },
  {
    icon: CalendarCheck,
    title: 'Directo a tus turnos',
    text: 'En segundos volvés a gestionar tus reservas.',
  },
]

export default function GoogleCallback() {
  const navigate = useNavigate()
  const loginWithGoogle = useGoogleLogin()
  const processed = useRef(false)

  useEffect(() => {
    const handleCallback = async () => {
      if (processed.current) return
      processed.current = true

      try {
        if (!isGoogleEnabled()) {
          navigate('/login', { replace: true })
          return
        }

        // Retrieve the Supabase session after the OAuth redirect
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession()
        if (sessionError || !sessionData?.session?.access_token) {
          navigate('/login', { replace: true })
          return
        }

        const providerToken = sessionData.session.access_token

        // Exchange the Supabase session for our own JWT via the backend
        await loginWithGoogle.mutateAsync(providerToken)

        const role = sessionStorage.getItem('sb-google-role') || 'client'
        sessionStorage.removeItem('sb-google-role')

        if (role === 'professional') {
          navigate('/onboarding/business', { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      } catch (err) {
        console.error('Google callback error:', err)
        navigate('/login', { replace: true })
      }
    }

    handleCallback()
  }, [navigate, loginWithGoogle])

  return (
    <AuthLayout
      brandEyebrow="Acceso con Google"
      headline="Un segundo y estás dentro"
      description="Estamos verificando tu cuenta de Google para darte acceso seguro a Smile Book."
      features={FEATURES}
      cardEyebrow="Cuenta de Google"
      cardTitle="Conectando tu cuenta"
      cardDescription="No cierres esta ventana. Esto tarda solo unos segundos."
      secureNote="Tu cuenta de Google no comparte tu contraseña con nosotros."
      topRight={
        <p className="text-sm text-muted-foreground">
          ¿Algo salió mal?{' '}
          <a
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Volver a intentar
          </a>
        </p>
      }
      maxWidth="max-w-md"
    >
      <div
        className="mt-6 flex flex-col items-center rounded-2xl border border-border/70 bg-muted/30 px-5 py-8 text-center"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 ring-1 ring-inset ring-primary/10">
          <img src="/logo.png" alt="" className="h-9 w-9 object-contain" />
          <span
            aria-hidden="true"
            className="absolute -inset-1 rounded-[1.15rem] border-2 border-teal/20"
          />
        </span>

        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-teal" aria-hidden="true" />
          Verificando tu cuenta de Google...
        </p>
        <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-muted-foreground">
          Estamos creando tu sesión de forma segura.
        </p>
      </div>
    </AuthLayout>
  )
}
