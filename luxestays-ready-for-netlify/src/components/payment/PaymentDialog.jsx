import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import UPIPayment from './UPIPayment';

const PaymentDialog = ({ isOpen, onClose, bookingDetails, onPaymentComplete, onPaymentFailed }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Pay using UPI to confirm your booking
          </DialogDescription>
        </DialogHeader>
        <UPIPayment
          bookingDetails={bookingDetails}
          onPaymentComplete={onPaymentComplete}
          onPaymentFailed={onPaymentFailed}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;