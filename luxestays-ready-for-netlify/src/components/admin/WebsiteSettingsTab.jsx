import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin, Save } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const WebsiteSettingsTab = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    company_address: '',
    company_phone: '',
    company_email: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
    map_location: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('website_settings')
        .select('*');
      
      if (error) throw error;

      const settingsObj = {};
      data.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });
      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        variant: "destructive",
        title: "Failed to load settings",
        description: "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Update each setting
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('website_settings')
          .upsert({ setting_key: key, setting_value: value }, { onConflict: 'setting_key' });
        
        if (error) throw error;
      }
      
      toast({
        title: "Settings Updated",
        description: "Website settings have been successfully saved."
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: "destructive",
        title: "Failed to save settings",
        description: "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Contact Information</CardTitle>
          <CardDescription>Update your company's contact details and location</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company_address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Address
            </Label>
            <Input
              id="company_address"
              name="company_address"
              value={settings.company_address || ''}
              onChange={handleInputChange}
              placeholder="Enter company address"
            />
          </div>
          <div>
            <Label htmlFor="company_phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone
            </Label>
            <Input
              id="company_phone"
              name="company_phone"
              value={settings.company_phone || ''}
              onChange={handleInputChange}
              placeholder="Enter contact number"
            />
          </div>
          <div>
            <Label htmlFor="company_email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </Label>
            <Input
              id="company_email"
              name="company_email"
              type="email"
              value={settings.company_email || ''}
              onChange={handleInputChange}
              placeholder="Enter contact email"
            />
          </div>
          <div>
            <Label htmlFor="map_location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Map Coordinates
            </Label>
            <Input
              id="map_location"
              name="map_location"
              value={settings.map_location || ''}
              onChange={handleInputChange}
              placeholder="Enter latitude,longitude (e.g., 9.498067,76.338844)"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Social Media Links</CardTitle>
          <CardDescription>Update your social media presence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="facebook_url" className="flex items-center gap-2">
              <Facebook className="w-4 h-4" /> Facebook
            </Label>
            <Input
              id="facebook_url"
              name="facebook_url"
              value={settings.facebook_url || ''}
              onChange={handleInputChange}
              placeholder="Enter Facebook URL"
            />
          </div>
          <div>
            <Label htmlFor="instagram_url" className="flex items-center gap-2">
              <Instagram className="w-4 h-4" /> Instagram
            </Label>
            <Input
              id="instagram_url"
              name="instagram_url"
              value={settings.instagram_url || ''}
              onChange={handleInputChange}
              placeholder="Enter Instagram URL"
            />
          </div>
          <div>
            <Label htmlFor="twitter_url" className="flex items-center gap-2">
              <Twitter className="w-4 h-4" /> Twitter
            </Label>
            <Input
              id="twitter_url"
              name="twitter_url"
              value={settings.twitter_url || ''}
              onChange={handleInputChange}
              placeholder="Enter Twitter URL"
            />
          </div>
          <div>
            <Label htmlFor="linkedin_url" className="flex items-center gap-2">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </Label>
            <Input
              id="linkedin_url"
              name="linkedin_url"
              value={settings.linkedin_url || ''}
              onChange={handleInputChange}
              placeholder="Enter LinkedIn URL"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </form>
  );
};

export default WebsiteSettingsTab;