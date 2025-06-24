import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import ResortDetailsPage from '@/pages/ResortDetailsPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import OurResortsPage from '@/pages/OurResortsPage';
import ContactUsPage from '@/pages/ContactUsPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import SignInPage from '@/pages/auth/SignInPage';
import SignUpPage from '@/pages/auth/SignUpPage';
import CustomerDashboardPage from '@/pages/CustomerDashboardPage';
import PaymentPage from '@/pages/PaymentPage';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const CEO_ADMIN_USERNAME = "LuxeStaysCEO";
const CEO_ADMIN_PASSWORD = "SUPERstay";
const ADMIN_LOGIN_PATH = "/login-admin";

const CEO_ROLE = "CEO";
const RESORT_OWNER_ROLE = "ResortOwner";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const [adminUser, setAdminUser] = useState(JSON.parse(localStorage.getItem('adminUser')) || null);
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('adminUser', JSON.stringify(adminUser));
  }, [adminUser]);

  const handleAdminLogin = (username, password) => {
    if (username === CEO_ADMIN_USERNAME && password === CEO_ADMIN_PASSWORD) {
      const user = { username: CEO_ADMIN_USERNAME, role: CEO_ROLE, resortId: null };
      setAdminUser(user);
      toast({ title: "Admin Login Successful", description: `Welcome, ${user.username}!` });
      return true;
    } else {
      toast({ variant: "destructive", title: "Admin Login Failed", description: "Incorrect username or password." });
      return false;
    }
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    toast({ title: "Admin Logout Successful" });
  };
  
  const isAdminAuthenticated = !!adminUser;

  return (
    <ThemeProvider defaultTheme="light" storageKey="luxestays-theme">
      <AuthProvider>
        <Router>
          <Layout isAdminAuthenticated={isAdminAuthenticated} adminUser={adminUser} onAdminLogout={handleAdminLogout}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/our-resorts" element={<OurResortsPage />} />
              <Route path="/contact-us" element={<ContactUsPage />} />
              <Route path="/resort/:id" element={<ResortDetailsPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <CustomerDashboardPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/payment" 
                element={
                  <PrivateRoute>
                    <PaymentPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  isAdminAuthenticated ? (
                    <AdminDashboardPage adminUser={adminUser} />
                  ) : (
                    <Navigate to={ADMIN_LOGIN_PATH} replace />
                  )
                } 
              />
              <Route 
                path={ADMIN_LOGIN_PATH}
                element={
                  isAdminAuthenticated ? (
                    <Navigate to="/admin" replace />
                  ) : (
                    <AdminLoginPage onAdminLogin={handleAdminLogin} />
                  )
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;