import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'

// Public Pages
import LandingPage from './pages/Public/LandingPage'
import BookingPage from './pages/Public/BookingPage'
import ConfirmPage from './pages/Public/ConfirmPage'

// Auth Pages
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'

// Dashboard Pages
import DashboardLayout from './components/layout/DashboardLayout'
import DashboardHome from './pages/Dashboard/DashboardHome'
import SchedulePage from './pages/Dashboard/SchedulePage'
import BookingsPage from './pages/Dashboard/BookingsPage'

function App() {
  const initAuth = useAuthStore((state) => state.init)

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/book/:serviceId" element={<BookingPage />} />
        <Route path="/confirm/:sessionId" element={<ConfirmPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="bookings" element={<BookingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
