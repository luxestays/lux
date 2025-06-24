import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const ContactUsPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [contactInfo, setContactInfo] = useState({
    company_address: 'Loading...',
    company_phone: 'Loading...',
    company_email: 'Loading...',
    map_location: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    fetchContactSettings();
  }, []);

  async function fetchContactSettings() {
    setLoadingSettings(true);
    try {
      const { data, error } = await supabase
        .from('website_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      const settingsObj = {};
      data.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });
      setContactInfo(prev => ({ ...prev, ...settingsObj }));
    } catch (error) {
      console.error('Error fetching contact settings:', error);
      toast({
        variant: "destructive",
        title: "Failed to load contact information",
        description: "Please try again later or contact support.",
      });
      setContactInfo({
        company_address: 'Not Available',
        company_phone: 'Not Available',
        company_email: 'Not Available',
        map_location: '',
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        linkedin_url: '',
      });
    } finally {
      setLoadingSettings(false);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    try {
      const { error } = await supabase.from('contact_messages').insert([
        { name: formData.name, email: formData.email, subject: formData.subject, message: formData.message }
      ]);

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "Thanks for reaching out. We'll get back to you soon.",
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not send your message. Please try again.",
      });
    }
  };
  
  const socialLinks = [
    { key: 'facebook_url', label: 'Facebook', icon: <Facebook size={20} />, href: contactInfo.facebook_url },
    { key: 'instagram_url', label: 'Instagram', icon: <Instagram size={20} />, href: contactInfo.instagram_url },
    { key: 'twitter_url', label: 'Twitter', icon: <Twitter size={20} />, href: contactInfo.twitter_url },
    { key: 'linkedin_url', label: 'LinkedIn', icon: <Linkedin size={20} />, href: contactInfo.linkedin_url },
  ].filter(link => link.href);


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-12 px-4"
    >
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-500 to-orange-400 mb-4">
          Get In Touch
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Have questions or need assistance? We're here to help. Reach out to us through any of the methods below.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-xl glassmorphic">
            <CardHeader>
              <CardTitle className="text-3xl text-foreground flex items-center">
                <Send className="w-7 h-7 mr-3 text-accent" /> Send Us a Message
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Fill out the form and we'll respond as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-foreground/90">Full Name</Label>
                  <Input id="name" name="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleInputChange} required className="mt-1 bg-background/80 border-input focus:border-accent" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-foreground/90">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} required className="mt-1 bg-background/80 border-input focus:border-accent" />
                </div>
                <div>
                  <Label htmlFor="subject" className="text-sm font-medium text-foreground/90">Subject</Label>
                  <Input id="subject" name="subject" type="text" placeholder="Booking Inquiry" value={formData.subject} onChange={handleInputChange} required className="mt-1 bg-background/80 border-input focus:border-accent" />
                </div>
                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-foreground/90">Message</Label>
                  <Textarea id="message" name="message" placeholder="Your message here..." value={formData.message} onChange={handleInputChange} rows={5} required className="mt-1 bg-background/80 border-input focus:border-accent" />
                </div>
                <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg font-semibold transition-transform duration-150 ease-in-out hover:scale-105">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-8"
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-muted-foreground">
                <Mail className="w-6 h-6 mr-4 text-accent" />
                <div>
                  <p className="font-semibold text-foreground">Email Us</p>
                  {loadingSettings ? <span className="text-sm">Loading...</span> : 
                    <a href={`mailto:${contactInfo.company_email}`} className="hover:text-accent transition-colors">{contactInfo.company_email}</a>
                  }
                </div>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Phone className="w-6 h-6 mr-4 text-accent" />
                <div>
                  <p className="font-semibold text-foreground">Call Us</p>
                  {loadingSettings ? <span className="text-sm">Loading...</span> : 
                    <a href={`tel:${contactInfo.company_phone}`} className="hover:text-accent transition-colors">{contactInfo.company_phone}</a>
                  }
                </div>
              </div>
              <div className="flex items-start text-muted-foreground">
                <MapPin className="w-6 h-6 mr-4 text-accent flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-foreground">Our Office</p>
                  {loadingSettings ? <span className="text-sm">Loading...</span> : 
                    <p>{contactInfo.company_address}</p>
                  }
                  <p>Open Mon-Fri, 9am - 5pm</p>
                </div>
              </div>
              {socialLinks.length > 0 && (
                <div className="pt-2">
                  <p className="font-semibold text-foreground mb-2">Follow Us</p>
                  <div className="flex space-x-3">
                    {socialLinks.map(social => (
                      <a key={social.key} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="text-muted-foreground hover:text-accent transition-colors duration-200">
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Before reaching out, you might find answers to your questions in our FAQ section.
              </p>
              <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/10" onClick={() => toast({title: "Coming Soon!", description: "FAQ page is under construction."}) }>
                View FAQs
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {contactInfo.map_location && (
        <motion.div 
          initial={{ opacity:0, y: 20 }}
          animate={{ opacity:1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Our Location on Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-96">
              <iframe
                title="Resort Location"
                src={`https://maps.google.com/maps?q=${contactInfo.map_location}&hl=en&z=14&output=embed`}
                width="100%"
                height="100%"
                style={{ border:0, borderRadius: '0.5rem' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ContactUsPage;