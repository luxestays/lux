import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Building2, ArrowLeft, CreditCard } from 'lucide-react';
import UPIPayment from '@/components/payment/UPIPayment';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    const details = location.state?.bookingDetails;
    if (!details) {
      toast({
        variant: "destructive",
        title: "Invalid Access",
        description: "Please select a resort and stay option first.",
      });
      navigate('/our-resorts');
      return;
    }
    setBookingDetails(details);
    setLoading(false);
  }, [location.state, navigate, toast]);

  const handlePaymentComplete = async () => {
    try {
      // Create booking record
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            resort_id: bookingDetails.resortId,
            stay_option_id: bookingDetails.stayOptionId,
            check_in_date: bookingDetails.checkIn,
            check_out_date: bookingDetails.checkOut,
            guest_count: bookingDetails.guests,
            total_amount: bookingDetails.totalAmount,
            status: 'confirmed',
            payment_status: 'completed',
            payment_method: 'upi',
            guest_name: user?.user_metadata?.full_name || '',
            guest_email: user?.email,
            user_id: user?.id,
          }
        ])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update stay option availability if needed
      const { error: availabilityError } = await supabase
        .from('stay_options')
        .update({ availability_status: 'limited' })
        .eq('id', bookingDetails.stayOptionId);

      if (availabilityError) throw availabilityError;

      toast({
        title: "Booking Confirmed!",
        description: "Your stay has been successfully booked.",
      });

      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error completing booking:', error);
      toast({
        variant: "destructive",
        title: "Booking Error",
        description: "There was an error completing your booking. Please try again.",
      });
    }
  };

  const handlePaymentFailed = () => {
    toast({
      variant: "destructive",
      title: "Payment Failed",
      description: "Please try booking again.",
    });
    navigate('/our-resorts');
  };

  if (loading) {
    return <div className="container mx-auto py-8 px-4 text-center">Loading payment details...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="w-6 h-6 mr-2 text-accent" />
                Booking Summary
              </CardTitle>
              <CardDescription>Review your booking details before payment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Resort Details</h3>
                  <p className="text-muted-foreground">{bookingDetails.resortName}</p>
                  <p className="text-sm text-muted-foreground">{bookingDetails.stayOptionName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Stay Details</h3>
                  <p className="text-muted-foreground">Check-in: {bookingDetails.checkIn}</p>
                  <p className="text-muted-foreground">Check-out: {bookingDetails.checkOut}</p>
                  <p className="text-muted-foreground">{bookingDetails.guests} Guest{bookingDetails.guests > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-foreground">Total Amount</span>
                  <span className="text-2xl font-bold text-accent">₹{bookingDetails.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <UPIPayment
            bookingDetails={bookingDetails}
            onPaymentComplete={handlePaymentComplete}
            onPaymentFailed={handlePaymentFailed}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentPage;