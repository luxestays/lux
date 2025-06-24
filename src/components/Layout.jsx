import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const Layout = ({ children, isAdminAuthenticated, adminUser, onAdminLogout }) => {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background text-foreground antialiased">
      <Navbar isAdminAuthenticated={isAdminAuthenticated} adminUser={adminUser} onAdminLogout={onAdminLogout} />
      <motion.main
        key={location.pathname} 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex-grow" 
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};

export default Layout;