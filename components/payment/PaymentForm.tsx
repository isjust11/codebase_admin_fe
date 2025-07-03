'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Label from '@/components/form/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { paymentApi, CreatePaymentRequest } from '@/services/payment-api';
import { toast } from 'sonner';

interface PaymentFormProps {
  onPaymentSuccess?: (payment: any) => void;
  onPaymentError?: (error: string) => void;
  defaultAmount?: number;
  description?: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onPaymentSuccess,
  onPaymentError,
  defaultAmount = 0,
  description: initialDescription = 'Payment',
}) => {
  const [amount, setAmount] = useState(defaultAmount);
  const [description, setDescription] = useState(initialDescription);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'vnpay' | 'momo' | 'zalopay'>('stripe');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const paymentData: CreatePaymentRequest = {
        amount,
        currency: 'VND',
        paymentMethod,
        description,
      };

      const response = await paymentApi.createPayment(paymentData);
      
      if (response.paymentUrl) {
        // Redirect to external payment gateway
        window.location.href = response.paymentUrl;
      } else if (response.clientSecret) {
        // Handle Stripe payment
        handleStripePayment(response);
      }
      
      onPaymentSuccess?.(response);
      toast.success('Payment initiated successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Payment failed';
      toast.error(errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async (paymentResponse: any) => {
    // This would integrate with Stripe Elements
    // For now, we'll just show a success message
    toast.success('Stripe payment initiated. Please complete the payment.');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <CardDescription>Complete your payment using your preferred method</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (VND)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount"
              min="0"
              step="1000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Credit/Debit Card (Stripe)</SelectItem>
                <SelectItem value="vnpay">VNPay</SelectItem>
                <SelectItem value="momo">MoMo</SelectItem>
                <SelectItem value="zalopay">ZaloPay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Payment description"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processing...' : `Pay ${amount.toLocaleString('vi-VN')} VND`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 