import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Star, Calendar, Clock, MapPin, Building2, CreditCard, User, Phone, Mail, Edit3, Save, PackageOpen, Briefcase, Settings } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CustomerDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookings, setBookings] = useState([]);
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    avatar_url: '',
  });
  const [newAvatarFile, setNewAvatarFile] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get('tab') || 'bookings';

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchProfile();
    } else {
      setLoadingBookings(false);
      setLoadingProfile(false);
    }
  }, [user]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          resorts (name, location, image_url),
          stay_options (name, description)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({ variant: "destructive", title: "Failed to load bookings" });
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setProfileForm({
          full_name: data.full_name || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.code !== 'PGRST116') { // Ignore "Missing one-to-one relationship" if profile doesn't exist yet
        toast({ variant: "destructive", title: "Failed to load profile" });
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    let avatarUrl = profileForm.avatar_url;

    if (newAvatarFile) {
      const fileExt = newAvatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user_avatars')
        .upload(filePath, newAvatarFile);

      if (uploadError) {
        toast({ variant: "destructive", title: "Avatar Upload Failed", description: uploadError.message });
        setLoadingProfile(false);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage.from('user_avatars').getPublicUrl(filePath);
      avatarUrl = publicUrlData.publicUrl;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          avatar_url: avatarUrl,
         })
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      setProfileForm({
        full_name: data.full_name || '',
        phone: data.phone || '',
        avatar_url: data.avatar_url || '',
      });
      setNewAvatarFile(null);
      setEditingProfile(false);
      toast({ title: "Profile Updated Successfully" });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ variant: "destructive", title: "Failed to update profile", description: error.message });
    } finally {
      setLoadingProfile(false);
    }
  };
  
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewAvatarFile(file);
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, avatar_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getAvatarFallbackName = (name) => {
    if (!name) return user?.email?.[0]?.toUpperCase() || 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };


  const renderBookingCard = (booking) => (
    <Card key={booking.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="md:flex">
        <div className="md:w-1/3">
          <img  
            alt={booking.resorts?.name || 'Resort image'} 
            className="object-cover w-full h-48 md:h-full"
           src="https://images.unsplash.com/photo-1660061540551-0955e8ec5b8b" />
        </div>
        <div className="md:w-2/3 p-6">
          <CardHeader className="p-0 mb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl">{booking.resorts?.name || 'Resort Name'}</CardTitle>
              <Badge variant={booking.payment_status === 'Paid' ? 'default' : 'secondary'} className={`${booking.payment_status === 'Paid' ? 'bg-green-500 text-white' : ''}`}>
                {booking.payment_status}
              </Badge>
            </div>
            <CardDescription className="flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-1.5 text-muted-foreground" /> {booking.resorts?.location || 'Resort Location'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            <p className="font-semibold text-lg text-accent">Stay: {booking.stay_options?.name || 'Stay Option'}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Check-in: {format(parseISO(booking.check_in_date), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Check-out: {format(parseISO(booking.check_out_date), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Guests: {booking.number_of_guests}</span>
              </div>
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Total: ₹{booking.total_amount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-2">Booked on: {format(parseISO(booking.created_at), 'MMM dd, yyyy, p')}</p>
          </CardContent>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/resort/${booking.resort_id}`)}>View Resort</Button>
            {booking.payment_status === 'Paid' && new Date(booking.check_out_date) < new Date() && (
              <Button size="sm" onClick={() => navigate(`/resort/${booking.resort_id}?review=true`)}>
                <Star className="w-4 h-4 mr-2" /> Write a Review
              </Button>
            )}
             {booking.payment_status === 'Payment Pending' && (
              <Button size="sm" variant="destructive" onClick={() => navigate('/payment', { state: { bookingDetails: { bookingId: booking.id, resortName: booking.resorts?.name, stayOptionName: booking.stay_options?.name, totalAmount: booking.total_amount } } })}>
                Complete Payment
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4"
    >
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground">Manage your bookings and profile information.</p>
      </header>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3 mb-6">
          <TabsTrigger value="bookings"><Briefcase className="w-4 h-4 mr-2" />My Bookings</TabsTrigger>
          <TabsTrigger value="profile"><Settings className="w-4 h-4 mr-2" />Profile Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Your Bookings</CardTitle>
              <CardDescription>View and manage your past and upcoming stays.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingBookings ? (
                <p>Loading your bookings...</p>
              ) : bookings.length > 0 ? (
                bookings.map(renderBookingCard)
              ) : (
                <div className="text-center py-12">
                  <PackageOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-xl font-semibold text-muted-foreground">You haven't booked anything yet.</p>
                  <Button className="mt-4" onClick={() => navigate('/our-resorts')}>Explore Resorts</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProfile ? (
                <p>Loading profile...</p>
              ) : profile || editingProfile ? (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                     <Avatar className="w-24 h-24 text-3xl">
                      <AvatarImage src={profileForm.avatar_url || ''} alt={profileForm.full_name} />
                      <AvatarFallback>{getAvatarFallbackName(profileForm.full_name)}</AvatarFallback>
                    </Avatar>
                    {editingProfile && (
                      <Input type="file" accept="image/*" onChange={handleAvatarChange} className="max-w-xs"/>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      value={profileForm.full_name} 
                      onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})} 
                      disabled={!editingProfile} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ''} disabled />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={profileForm.phone} 
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} 
                      disabled={!editingProfile} 
                      placeholder="e.g., +91 XXXXXXXXXX"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    {editingProfile ? (
                      <>
                        <Button type="button" variant="outline" onClick={() => { setEditingProfile(false); fetchProfile(); }}>Cancel</Button>
                        <Button type="submit" disabled={loadingProfile}>
                          <Save className="w-4 h-4 mr-2" /> {loadingProfile ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </>
                    ) : (
                      <Button type="button" onClick={() => setEditingProfile(true)}>
                        <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                      </Button>
                    )}
                  </div>
                </form>
              ) : (
                <p>Could not load profile information. You might need to complete your profile.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default CustomerDashboardPage;