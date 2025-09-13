import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LandingPage from './components/landing/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './components/dashboard/Dashboard';
import Invoices from './pages/Invoices';
import Clients from './pages/Clients';
import Estimates from './pages/Estimates';
import Items from './pages/Items';
import TimeTracking from './pages/TimeTracking';
import Expenses from './pages/Expenses';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import CookiePolicy from './pages/CookiePolicy';
import RefundPolicy from './pages/RefundPolicy';
import FAQ from './pages/FAQ';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/" />;
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                className="mt-16"
              />
              <Toaster position="top-right" />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Navigate to="/register" />} />
                <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
                
                {/* Legal Pages */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/refund" element={<RefundPolicy />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/pricing" element={<Navigate to="/register" />} />
                
                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/invoices"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Invoices />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clients"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Clients />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/estimates"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Estimates />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/items"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Items />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/time-tracking"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <TimeTracking />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/expenses"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Expenses />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Reports />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Settings />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Profile />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <Calendar />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
