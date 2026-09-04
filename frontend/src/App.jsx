import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

// Public Pages
import LandingPage from '@/pages/Public/LandingPage'
import ServicesList from '@/pages/Public/ServicesList'
import BookingPage from '@/pages/Public/BookingPage'
import ConfirmPage from '@/pages/Public/ConfirmPage'
import TermsPage from '@/pages/Public/TermsPage'
import LegalPage from '@/pages/Public/LegalPage'

// Auth Pages
import LoginPage from '@/pages/Auth/LoginPage'
import RegisterPage from '@/pages/Auth/RegisterPage'
import GoogleCallback from '@/pages/Auth/GoogleCallback'
import ForgotPasswordPage from '@/pages/Auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/Auth/ResetPasswordPage'

// Onboarding Pages
import SetupBusiness from '@/pages/Onboarding/SetupBusiness'
import SetupServices from '@/pages/Onboarding/SetupServices'
import SetupSchedule from '@/pages/Onboarding/SetupSchedule'

// Dashboard Pages
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardHome from '@/pages/Dashboard/DashboardHome'
import SchedulePage from '@/pages/Dashboard/SchedulePage'
import BookingsPage from '@/pages/Dashboard/BookingsPage'
import ServicesPage from '@/pages/Dashboard/ServicesPage'
import BusinessSettingsPage from '@/pages/Dashboard/BusinessSettingsPage'
import ProfilePage from '@/pages/Dashboard/ProfilePage'

function App() {
  const initAuth = useAuthStore((state) => state.init)

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/book" element={<ServicesList />} />
        <Route path="/book/:serviceId" element={<BookingPage />} />
        <Route path="/confirm/:sessionId" element={<ConfirmPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/legal" element={<LegalPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<GoogleCallback />} />

        {/* Onboarding Routes */}
        <Route path="/onboarding/business" element={<SetupBusiness />} />
        <Route path="/onboarding/services" element={<SetupServices />} />
        <Route path="/onboarding/schedule" element={<SetupSchedule />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="settings/business" element={<BusinessSettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
