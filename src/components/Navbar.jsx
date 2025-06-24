import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut, UserCircle, Menu, X, Building2, Briefcase, User as UserIcon, Settings } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabaseClient';


const Navbar = ({ isAdminAuthenticated, adminUser, onAdminLogout }) => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('full_name, avatar_url')
          .eq('auth_user_id', user.id)
          .single();
        
        if (error) {
          console.warn('Error fetching user profile for navbar:', error.message);
        } else if (data) {
          setUserProfile(data);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [user]);


  const handleAdminLogoutInternal = () => {
    onAdminLogout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleUserLogout = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinkClasses = ({ isActive }) =>
    `relative text-sm font-medium transition-colors hover:text-accent ${
      isActive ? 'text-accent' : 'text-foreground/70'
    } after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 ${isActive ? 'after:w-full' : 'hover:after:w-full'}`;


  const menuItems = [
    { to: '/', label: 'Home' },
    { to: '/our-resorts', label: 'Our Resorts' },
    { to: '/contact-us', label: 'Contact Us' },
  ];

  const adminMenuItems = [
    { to: '/admin', label: 'Dashboard' },
  ];
  
  const userMenuItems = [
    { to: '/dashboard', label: 'My Bookings', icon: <Briefcase className="mr-2 h-4 w-4" /> },
    { to: '/dashboard?tab=profile', label: 'Profile Settings', icon: <Settings className="mr-2 h-4 w-4" /> },
  ];

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
    exit: { opacity: 0, height: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } }
  };

  const mobileMenuItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };
  
  const getAvatarFallbackName = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };


  return (
    <motion.nav 
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.2 }}
      className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70"
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center space-x-2.5 text-accent hover:opacity-90 transition-opacity duration-300">
          <Building2 className="h-8 w-8" />
          <span className="text-3xl font-bold tracking-tight">LuxeStays</span>
        </Link>

        <div className="hidden lg:flex items-center space-x-8">
          {menuItems.map(item => (
            <NavLink key={item.to} to={item.to} className={navLinkClasses}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
            className="text-foreground/70 hover:text-accent hover:bg-accent/10 transition-colors"
          >
            {theme === 'light' ? <Moon className="h-[1.3rem] w-[1.3rem]" /> : <Sun className="h-[1.3rem] w-[1.3rem]" />}
          </Button>

          {isAdminAuthenticated && adminUser ? (
            <div className="hidden lg:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Admin Menu" className="text-accent hover:bg-accent/10">
                    <UserCircle className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{adminUser.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">Role: {adminUser.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer">
                    Admin Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleAdminLogoutInternal} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : user ? (
             <div className="hidden lg:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                     <Avatar className="h-9 w-9">
                      <AvatarImage src={userProfile?.avatar_url || ''} alt={userProfile?.full_name || user.email} />
                      <AvatarFallback>{getAvatarFallbackName(userProfile?.full_name || user.email)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userProfile?.full_name || user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userMenuItems.map(item => (
                    <DropdownMenuItem key={item.to} onClick={() => navigate(item.to)} className="cursor-pointer">
                      {item.icon}
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleUserLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden lg:flex items-center space-x-2">
              <Button variant="ghost" onClick={() => navigate('/signin')} className="text-foreground/80 hover:text-accent">Sign In</Button>
              <Button onClick={() => navigate('/signup')} className="bg-accent hover:bg-accent/90 text-accent-foreground">Sign Up</Button>
            </div>
          )}
          
          <div className="lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle mobile menu" className="text-foreground/70 hover:text-accent hover:bg-accent/10 transition-colors">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-b border-border/60 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col space-y-1 px-4 pt-3 pb-4">
              {menuItems.map(item => (
                <motion.div variants={mobileMenuItemVariants} key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `block px-3 py-2.5 rounded-md text-base font-medium transition-colors hover:bg-accent/10 hover:text-accent ${
                        isActive ? 'bg-accent/10 text-accent' : 'text-foreground/80'
                      }`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
              
              <motion.div variants={mobileMenuItemVariants} className="border-t border-border/60 my-2" />

              {isAdminAuthenticated && adminUser ? (
                <>
                  {adminMenuItems.map(item => (
                    <motion.div variants={mobileMenuItemVariants} key={item.to}>
                      <NavLink to={item.to} className={({ isActive }) => `block px-3 py-2.5 rounded-md text-base font-medium transition-colors hover:bg-accent/10 hover:text-accent ${ isActive ? 'bg-accent/10 text-accent' : 'text-foreground/80' }`} onClick={() => setMobileMenuOpen(false)}>
                        {item.label}
                      </NavLink>
                    </motion.div>
                  ))}
                  <motion.div variants={mobileMenuItemVariants} className="pt-2">
                    <div className="px-3 py-2.5">
                        <p className="text-sm font-medium leading-none text-foreground">{adminUser.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">Role: {adminUser.role}</p>
                    </div>
                    <Button variant="ghost" className="w-full justify-start px-3 py-2.5 text-base font-medium text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleAdminLogoutInternal}>
                      <LogOut className="mr-2 h-5 w-5" /> Logout
                    </Button>
                  </motion.div>
                </>
              ) : user ? (
                 <>
                  {userMenuItems.map(item => (
                    <motion.div variants={mobileMenuItemVariants} key={item.to}>
                      <NavLink to={item.to} className={({ isActive }) => `flex items-center px-3 py-2.5 rounded-md text-base font-medium transition-colors hover:bg-accent/10 hover:text-accent ${ isActive ? 'bg-accent/10 text-accent' : 'text-foreground/80' }`} onClick={() => setMobileMenuOpen(false)}>
                        {item.icon} {item.label}
                      </NavLink>
                    </motion.div>
                  ))}
                  <motion.div variants={mobileMenuItemVariants} className="pt-2">
                    <div className="px-3 py-2.5">
                        <p className="text-sm font-medium leading-none text-foreground">{userProfile?.full_name || user.email}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                    <Button variant="ghost" className="w-full justify-start px-3 py-2.5 text-base font-medium text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleUserLogout}>
                      <LogOut className="mr-2 h-5 w-5" /> Logout
                    </Button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div variants={mobileMenuItemVariants}>
                    <Button variant="outline" className="w-full my-1" onClick={() => { navigate('/signin'); setMobileMenuOpen(false); }}>Sign In</Button>
                  </motion.div>
                  <motion.div variants={mobileMenuItemVariants}>
                    <Button className="w-full my-1 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}>Sign Up</Button>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;