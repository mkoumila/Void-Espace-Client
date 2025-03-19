import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import SignaturePV from './pages/SignaturePV'
import Payments from './pages/Payments'
import SetupPassword from './pages/SetupPassword'
import PasswordSetupAlert from './components/PasswordSetupAlert'
import Projects from './pages/Projects'
import TMA from './pages/TMA'
import TMAProject from './pages/TMAProject'
import Quotes from './pages/Quotes'
import Login from './pages/Login'
import ProjectDetails from './pages/ProjectDetails'
import ProjectAudit from './pages/ProjectAudit'
import AdminDashboard from './pages/admin/Dashboard'
import AdminSettings from './pages/admin/AdminSettings'
import UserProfile from './pages/admin/user/UserProfile'
import UserPV from './pages/admin/user/UserPV'
import UserPayments from './pages/admin/user/UserPayments'
import UserProjects from './pages/admin/user/UserProjects'
import UserQuotes from './pages/admin/user/UserQuotes'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './api/AuthContext'

// Layout component with navigation and sidebar
const AppLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <div className="flex pt-16">
      <Sidebar />
      <main className="flex-1 ml-64">
        <div className="max-w-[1920px] w-full mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
    <PasswordSetupAlert />
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/setup-password" element={<SetupPassword />} />
          
          {/* Protected routes with layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Regular user routes */}
              <Route index element={<Dashboard />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:projectId" element={<ProjectDetails />} />
              <Route path="/projects/:projectId/audit" element={<ProjectAudit />} />
              <Route path="/tma" element={<TMA />} />
              <Route path="/tma/:projectId" element={<TMAProject />} />
              <Route path="/signature-pv" element={<SignaturePV />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/quotes" element={<Quotes />} />
              
              {/* Admin routes - require admin role */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users/:userId" element={<UserProfile />} />
                <Route path="/admin/users/:userId/pv" element={<UserPV />} />
                <Route path="/admin/users/:userId/payments" element={<UserPayments />} />
                <Route path="/admin/users/:userId/quotes" element={<UserQuotes />} />
                <Route path="/admin/users/:userId/projects" element={<UserProjects />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
