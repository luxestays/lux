import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6 bg-gradient-to-br from-background via-secondary/20 to-background"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.2 }}
      >
        <AlertTriangle className="w-24 h-24 text-destructive mb-8" />
      </motion.div>
      
      <h1 className="text-6xl font-extrabold text-foreground mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-accent mb-6">Oops! Page Not Found.</h2>
      <p className="text-lg text-muted-foreground mb-10 max-w-md">
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on track!
      </p>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out">
          <Link to="/">Go Back to Homepage</Link>
        </Button>
      </motion.div>
      <div className="mt-16">
        <img 
            className="w-64 h-auto opacity-50"
            alt="Sad suitcase illustration"
         src="https://images.unsplash.com/photo-1691928305905-14b3bd1306e6" />
      </div>
    </motion.div>
  );
};

export default NotFoundPage;