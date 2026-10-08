import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Public Pages
import LandingPage from '@/pages/Public/LandingPage'

const ServicesList = lazy(() => import('@/pages/Public/ServicesList'))
const BookingPage = lazy(() => import('@/pages/Public/BookingPage'))
const ConfirmPage = lazy(() => import('@/pages/Public/ConfirmPage'))
const TermsPage = lazy(() => import('@/pages/Public/TermsPage'))
const LegalPage = lazy(() => import('@/pages/Public/LegalPage'))

// Auth Pages
import LoginPage from '@/pages/Auth/LoginPage'

const RegisterPage = lazy(() => import('@/pages/Auth/RegisterPage'))
const GoogleCallback = lazy(() => import('@/pages/Auth/GoogleCallback'))
const ForgotPasswordPage = lazy(() => import('@/pages/Auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/Auth/ResetPasswordPage'))

// Onboarding Pages
const SetupBusiness = lazy(() => import('@/pages/Onboarding/SetupBusiness'))
const SetupServices = lazy(() => import('@/pages/Onboarding/SetupServices'))
const SetupSchedule = lazy(() => import('@/pages/Onboarding/SetupSchedule'))

// Dashboard Pages
const DashboardLayout = lazy(() => import('@/components/layout/DashboardLayout'))
const DashboardHome = lazy(() => import('@/pages/Dashboard/DashboardHome'))
const SchedulePage = lazy(() => import('@/pages/Dashboard/SchedulePage'))
const BookingsPage = lazy(() => import('@/pages/Dashboard/BookingsPage'))
const ServicesPage = lazy(() => import('@/pages/Dashboard/ServicesPage'))
const BusinessSettingsPage = lazy(() => import('@/pages/Dashboard/BusinessSettingsPage'))
const ProfilePage = lazy(() => import('@/pages/Dashboard/ProfilePage'))

function SuspenseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-border border-t-primary animate-spin" aria-label="Cargando" role="status" />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<SuspenseFallback />}>
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
      </Suspense>
    </BrowserRouter>
  )
}

export default App