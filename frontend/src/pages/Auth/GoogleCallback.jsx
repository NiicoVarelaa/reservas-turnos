import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabaseClient, isGoogleEnabled } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/authStore'

export default function GoogleCallback() {
  const navigate = useNavigate()
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle)
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
        await loginWithGoogle(providerToken)

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <div className="flex flex-col items-center gap-4">
        <img src="/logo.png" alt="Smile Book" className="w-14 h-14 object-contain" />
        <div className="flex items-center gap-3 text-muted-foreground">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          <p className="text-sm">Verificando tu cuenta de Google...</p>
        </div>
      </div>
    </div>
  )
}
