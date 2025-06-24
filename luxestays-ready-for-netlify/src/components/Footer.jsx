import React from 'react';
import { Building2, Facebook, Instagram, Twitter, Linkedin, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/our-resorts', label: 'Our Resorts' },
    { href: '/#destinations', label: 'Destinations' },
    { href: '/contact-us', label: 'Contact Us' },
  ];

  const legalLinks = [
    { href: '/terms', label: 'Terms of Service' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/faq', label: 'FAQ' },
  ];

  const socialLinks = [
    { href: '#', label: 'Facebook', icon: <Facebook size={20} /> },
    { href: '#', label: 'Instagram', icon: <Instagram size={20} /> },
    { href: '#', label: 'Twitter', icon: <Twitter size={20} /> },
    { href: '#', label: 'LinkedIn', icon: <Linkedin size={20} /> },
  ];

  return (
    <footer className="bg-muted/30 border-t border-border/50 text-muted-foreground pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-10 mb-12">
          <div className="xl:col-span-2">
            <Link to="/" className="flex items-center space-x-2.5 text-accent mb-5">
              <Building2 className="h-9 w-9" />
              <span className="text-3xl font-bold">LuxeStays</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-md">
              Discover unparalleled luxury and serene getaways with LuxeStays. We curate the finest resorts in Kerala's most enchanting destinations.
            </p>
            <p className="text-sm font-semibold text-foreground mb-2">Stay Updated</p>
            <form className="flex gap-2 max-w-sm">
              <Input type="email" placeholder="Enter your email" className="bg-background/70 focus:border-accent" />
              <Button type="submit" variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground">Subscribe</Button>
            </form>
          </div>

          <div>
            <p className="font-semibold text-foreground mb-4 text-lg">Quick Links</p>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map(link => (
                <li key={link.label}>
                  <Link to={link.href} className="hover:text-accent transition-colors duration-200">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-foreground mb-4 text-lg">Get In Touch</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin size={16} className="mr-2.5 mt-0.5 text-accent flex-shrink-0" />
                <span>123 Backwater Lane, Alleppey, Kerala, India</span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2.5 text-accent flex-shrink-0" />
                <a href="tel:+911234567890" className="hover:text-accent transition-colors">+91 123 456 7890</a>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2.5 text-accent flex-shrink-0" />
                <a href="mailto:support@luxestays.com" className="hover:text-accent transition-colors">support@luxestays.com</a>
              </li>
            </ul>
          </div>
          
          <div>
            <p className="font-semibold text-foreground mb-4 text-lg">Follow Us</p>
            <div className="flex space-x-4 mb-4">
              {socialLinks.map(social => (
                <a key={social.label} href={social.href} aria-label={social.label} className="text-muted-foreground hover:text-accent transition-colors duration-200">
                  {social.icon}
                </a>
              ))}
            </div>
            <p className="font-semibold text-foreground mb-2.5 text-lg mt-6">Legal</p>
             <ul className="space-y-2.5 text-sm">
              {legalLinks.map(link => (
                <li key={link.label}>
                  <Link to={link.href} className="hover:text-accent transition-colors duration-200">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 text-center text-xs">
          <p>&copy; {currentYear} LuxeStays Kerala. All rights reserved. Designed & Developed with <span className="text-red-500">❤️</span> by Hostinger Horizons.</p>
          <p className="mt-1">Images sourced from Unsplash. Map data by OpenStreetMap.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;