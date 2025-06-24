import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ShieldCheck as ShieldLock, User } from 'lucide-react';

const AdminLoginPage = ({ onAdminLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdminLogin(username, password);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-gradient-to-br from-secondary/20 via-background to-secondary/30 p-6"
    >
      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-card shadow-2xl rounded-xl border border-border/50">
        <CardHeader className="text-center p-0">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="inline-block mb-4"
          >
            <ShieldLock className="w-16 h-16 text-accent mx-auto" />
          </motion.div>
          <CardTitle className="text-3xl font-bold text-foreground">Admin Portal</CardTitle>
          <CardDescription className="text-muted-foreground pt-1">
            Secure access for LuxeStays administrators.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-muted-foreground mb-1.5 flex items-center">
                <User className="w-4 h-4 mr-1.5 text-muted-foreground/80" /> Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm bg-background/80"
                placeholder="Enter your admin username"
              />
            </div>
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1.5">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm bg-background/80"
                placeholder="Enter admin password"
              />
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-accent-foreground bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all duration-150 ease-in-out"
              >
                Login Securely
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-8 text-center max-w-md">
        This login page is intended for authorized administrators only. Access attempts are monitored.
        Default CEO: LuxeStaysCEO / SUPERstay
      </p>
    </motion.div>
  );
};

export default AdminLoginPage;