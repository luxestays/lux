import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import ReviewSection from '@/components/reviews/ReviewSection';
import { MapPin, Calendar, Users, Star, Info, Building2, DollarSign, Check, X } from 'lucide-react';

// Rest of the file content remains exactly the same...
const ResortDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [resort, setResort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStayOption, setSelectedStayOption] = useState(null);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(new Date().setDate(new Date().getDate() + 2)));
  const [numberOfGuests, setNumberOfGuests] = useState(2);

  useEffect(() => {
    fetchResortDetails();
  }, [id]);

  const fetchResortDetails = async () => {
    try {
      const { data: resortData, error: resortError } = await supabase
        .from('resorts')
        .select(`
          *,
          stay_options (*)
        `)
        .eq('id', id)
        .single();

      if (resortError) throw resortError;

      if (resortData) {
        setResort({
          ...resortData,
          pricePerNight: resortData.price_per_night,
          imageUrl: resortData.image_url,
          stayOptions: (resortData.stay_options || []).map(so => ({
            ...so,
            imageUrl: so.image_url,
            pricingModel: so.pricing_model,
            availabilityStatus: so.availability_status,
          }))
        });
      }
    } catch (error) {
      console.error('Error fetching resort details:', error);
      toast({
        variant: "destructive",
        title: "Failed to load resort details",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to complete your booking.",
      });
      navigate('/signin', { state: { from: location.pathname } });
      return;
    }

    if (!selectedStayOption) {
      toast({
        variant: "destructive",
        title: "No Stay Option Selected",
        description: "Please select a stay option to proceed.",
      });
      return;
    }
    
    const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalAmount = selectedStayOption.price * nights * (selectedStayOption.pricingModel === 'per_person' ? numberOfGuests : 1);

    const bookingDetails = {
      resortId: resort.id,
      resortName: resort.name,
      stayOptionId: selectedStayOption.id,
      stayOptionName: selectedStayOption.name,
      totalAmount: totalAmount,
      checkIn: checkInDate.toISOString().split('T')[0],
      checkOut: checkOutDate.toISOString().split('T')[0],
      guests: numberOfGuests,
    };

    navigate('/payment', { state: { bookingDetails } });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-muted-foreground">Loading resort details...</div>
      </div>
    );
  }

  if (!resort) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-muted-foreground">Resort not found.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Resort Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center">
              <Building2 className="w-8 h-8 mr-3 text-accent" />
              {resort.name}
            </h1>
            <p className="text-muted-foreground flex items-center mt-2">
              <MapPin className="w-4 h-4 mr-1.5" />
              {resort.location}
            </p>
          </div>
          {resort.rating && (
            <div className="flex items-center space-x-1 bg-accent/10 px-3 py-1.5 rounded-lg">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{resort.rating}</span>
            </div>
          )}
        </div>

        {/* Resort Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-[300px] md:h-[400px] rounded-xl overflow-hidden">
            <img  alt={`Main view of ${resort.name}`} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1648845010561-f4df369ff566" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="h-[140px] md:h-[190px] rounded-xl overflow-hidden">
                <img  alt={`Additional view ${index} of ${resort.name}`} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1660061540551-0955e8ec5b8b" />
              </div>
            ))}
          </div>
        </div>

        {/* Resort Description */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">About this resort</h2>
            <p className="text-muted-foreground">{resort.description}</p>
            
            {resort.amenities && resort.amenities.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Resort Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {resort.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="text-sm">
                      <Check className="w-3.5 h-3.5 mr-1" />
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Stay Options</CardTitle>
                <CardDescription>Select your preferred accommodation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resort.stayOptions?.map((option) => (
                  <div
                    key={option.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedStayOption?.id === option.id
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-accent/50'
                    }`}
                    onClick={() => setSelectedStayOption(option)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{option.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant="outline">
                            {option.pricingModel === 'per_person' ? 'Per Person' : 'Fixed Price'}
                          </Badge>
                          <Badge variant="outline">
                            Up to {option.capacity} guests
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-accent">
                          ₹{option.price.toLocaleString('en-IN')}
                        </p>
                        <p className="text-sm text-muted-foreground">per night</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Book Your Stay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Check-in Date</Label>
                  <DatePicker
                    date={checkInDate}
                    setDate={setCheckInDate}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>Check-out Date</Label>
                  <DatePicker
                    date={checkOutDate}
                    setDate={setCheckOutDate}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>Number of Guests</Label>
                  <Input
                    type="number"
                    min={1}
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(Math.max(1, parseInt(e.target.value)))}
                    className="w-full"
                  />
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleProceedToPayment}
                  disabled={!selectedStayOption}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection resortId={resort.id} />
      </motion.div>
    </div>
  );
};

export default ResortDetailsPage;