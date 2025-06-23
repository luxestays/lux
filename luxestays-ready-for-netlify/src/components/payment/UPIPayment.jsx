import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Clock, CheckCircle, XCircle, Loader2, CreditCard, QrCode } from 'lucide-react';

const UPIPayment = ({ bookingDetails, onPaymentComplete, onPaymentFailed }) => {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [showQR, setShowQR] = useState(false);

  // Generate a dummy UPI ID for demonstration
  const upiId = "luxestays@upi";
  
  // Generate UPI payment link
  const getUPILink = () => {
    const upiLink = `upi://pay?pa=${upiId}&pn=LuxeStays&am=${bookingDetails.totalAmount}&cu=INR&tn=Booking%20at%20${encodeURIComponent(bookingDetails.resortName)}`;
    return upiLink;
  };

  useEffect(() => {
    if (timeLeft > 0 && paymentStatus === 'pending') {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && paymentStatus === 'pending') {
      setPaymentStatus('expired');
      onPaymentFailed();
    }
  }, [timeLeft, paymentStatus, onPaymentFailed]);

  // Format time remaining
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulate payment verification
  const checkPaymentStatus = async () => {
    try {
      // In a real implementation, this would make an API call to verify the payment
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ status: Math.random() > 0.5 ? 'success' : 'pending' });
        }, 2000);
      });

      if (response.status === 'success') {
        setPaymentStatus('completed');
        onPaymentComplete();
        toast({
          title: "Payment Successful!",
          description: "Your booking has been confirmed.",
        });
      } else {
        toast({
          title: "Payment Pending",
          description: "Please complete the payment to confirm your booking.",
        });
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast({
        variant: "destructive",
        title: "Error Checking Payment",
        description: "Please try again or contact support.",
      });
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Complete Payment</span>
          {paymentStatus === 'pending' && (
            <span className="text-sm font-normal text-muted-foreground flex items-center">
              <Clock className="w-4 h-4 mr-1" /> {formatTime(timeLeft)}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Pay ₹{bookingDetails.totalAmount.toLocaleString('en-IN')} using UPI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {paymentStatus === 'pending' && (
            <>
              {showQR ? (
                <div className="flex flex-col items-center space-y-4">
                  <QRCodeSVG
                    value={getUPILink()}
                    size={200}
                    level="H"
                    includeMargin={true}
                    className="bg-white p-2 rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Scan this QR code with any UPI app
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    className="w-full"
                    onClick={() => {
                      window.location.href = getUPILink();
                      setTimeout(checkPaymentStatus, 5000);
                    }}
                  >
                    <CreditCard className="w-4 h-4 mr-2" /> Pay Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowQR(true)}
                  >
                    <QrCode className="w-4 h-4 mr-2" /> Show QR
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={checkPaymentStatus}
              >
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Check Payment Status
              </Button>
            </>
          )}

          {paymentStatus === 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-500 mb-2">
                Payment Successful!
              </h3>
              <p className="text-muted-foreground">
                Your booking has been confirmed.
              </p>
            </motion.div>
          )}

          {paymentStatus === 'expired' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4"
            >
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-destructive mb-2">
                Payment Time Expired
              </h3>
              <p className="text-muted-foreground mb-4">
                Please try booking again.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UPIPayment;