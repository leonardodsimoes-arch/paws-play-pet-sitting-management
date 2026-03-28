import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Dog } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
export function BookingFlow() {
  const navigate = useNavigate();
  const [selectedDog, setSelectedDog] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: dogs = [], isLoading: loadingDogs } = useQuery({
    queryKey: ['dogs'],
    queryFn: () => api<{ items: Dog[] }>('/api/dogs').then(res => res.items)
  });
  const services = [
    { id: 'stay', name: 'Basic Stay', price: 45, desc: 'Boarding (7 AM to 7 AM next day)' },
    { id: 'daycare', name: 'Daycare', price: 30, desc: 'Playtime (7 AM to 7 PM)' },
    { id: 'walk', name: 'Dog Walk', price: 15, desc: '30-minute neighborhood walk' },
  ];
  const handleBooking = async () => {
    if (!selectedDog || !service || !date) {
      toast.error("Oops!", { description: "Please fill in all details first." });
      return;
    }
    const selectedService = services.find(s => s.id === service);
    setIsSubmitting(true);
    try {
      await api('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          dogId: selectedDog,
          ownerId: 'u1', // Mock
          serviceType: service,
          startDate: date,
          endDate: date, // Simplified for demo
          total: selectedService?.price || 0
        })
      });
      toast.success("Booking Requested!", { description: "We'll confirm your spot shortly." });
      navigate('/dashboard');
    } catch (err) {
      toast.error("Booking failed", { description: String(err) });
    } finally {
      setIsSubmitting(false);
    }
  };
  const selectedService = services.find(s => s.id === service);
  return (
    <AppLayout container>
      <div className="space-y-12">
        <header className="text-center">
          <h1 className="text-5xl font-black">Plan a Playdate</h1>
          <p className="text-xl font-bold text-muted-foreground mt-2">Pick your service and dates below</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="playful-card p-8 bg-white space-y-6">
              <div className="space-y-2">
                <Label className="font-black text-lg">Who is visiting?</Label>
                <Select onValueChange={setSelectedDog} disabled={loadingDogs}>
                  <SelectTrigger className="playful-input h-14 font-bold">
                    <SelectValue placeholder={loadingDogs ? "Loading pack..." : "Select a dog"} />
                  </SelectTrigger>
                  <SelectContent className="border-4 border-black rounded-xl">
                    {dogs.map(dog => (
                      <SelectItem key={dog.id} value={dog.id} className="font-bold">{dog.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label className="font-black text-lg">Choose Service</Label>
                <div className="grid grid-cols-1 gap-4">
                  {services.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setService(s.id)}
                      className={`text-left p-6 border-4 border-black rounded-2xl transition-all ${
                        service === s.id ? 'bg-playful-yellow shadow-solid-sm translate-x-[2px] translate-y-[2px]' : 'bg-white shadow-solid hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-black text-xl">{s.name}</span>
                        <span className="font-black text-xl">${s.price}</span>
                      </div>
                      <p className="font-bold text-muted-foreground mt-1">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-lg">Select Start Date</Label>
                <input
                  type="date"
                  onChange={(e) => setDate(e.target.value)}
                  className="playful-input w-full h-14 font-black text-lg"
                />
              </div>
            </div>
          </div>
          <div className="space-y-6 sticky top-8">
            <div className="playful-card p-6 bg-playful-blue text-white space-y-6">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Calculator /> Summary
              </h2>
              <div className="space-y-2 font-bold border-t-4 border-black/20 pt-4">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span>{selectedService?.name || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Base Rate:</span>
                  <span>${selectedService?.price || 0}</span>
                </div>
                <div className="flex justify-between text-2xl font-black border-t-4 border-black/20 pt-4 mt-4">
                  <span>Total:</span>
                  <span>${selectedService?.price || 0}</span>
                </div>
              </div>
              <Button 
                onClick={handleBooking} 
                disabled={isSubmitting}
                className="playful-btn w-full bg-playful-yellow text-black border-black hover:bg-playful-yellow/90"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Booking
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}