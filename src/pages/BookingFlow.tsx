import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Loader2, Clock, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Dog } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { cn } from '@/lib/utils';
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
    { id: 'stay', name: 'Basic Stay', price: 45, time: '7 AM - 7 AM', desc: 'Overnight Boarding' },
    { id: 'daycare', name: 'Daycare', price: 30, time: '7 AM - 7 PM', desc: 'Playtime' },
    { id: 'walk', name: 'Dog Walk', price: 15, time: '30 mins', desc: 'Active Exercise' },
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
          ownerId: 'u1',
          serviceType: service,
          startDate: date,
          endDate: date,
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
          <h1 className="text-5xl font-black italic tracking-tighter">PLAN A PLAYDATE</h1>
          <p className="text-xl font-bold text-muted-foreground mt-2">Pick your service and dates below</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="playful-card p-8 bg-white space-y-8">
              <div className="space-y-3">
                <Label className="font-black text-xl flex items-center gap-2">
                  <Dog size={24} className="text-playful-pink" /> Who is visiting?
                </Label>
                <Select onValueChange={setSelectedDog} disabled={loadingDogs}>
                  <SelectTrigger className="playful-input h-14 font-black text-lg border-black">
                    <SelectValue placeholder={loadingDogs ? "Loading pack..." : "Select a dog"} />
                  </SelectTrigger>
                  <SelectContent className="border-4 border-black rounded-xl">
                    {dogs.map(dog => (
                      <SelectItem key={dog.id} value={dog.id} className="font-black py-3">{dog.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label className="font-black text-xl">Select Service Package</Label>
                <div className="grid grid-cols-1 gap-4">
                  {services.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setService(s.id)}
                      className={cn(
                        "text-left p-6 border-4 border-black rounded-2xl transition-all relative overflow-hidden group",
                        service === s.id 
                          ? 'bg-playful-yellow shadow-solid-sm translate-x-[2px] translate-y-[2px]' 
                          : 'bg-white shadow-solid hover:bg-muted/50'
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-2xl uppercase tracking-tighter">{s.name}</span>
                            <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                              <Clock size={10} /> {s.time}
                            </span>
                          </div>
                          <p className="font-bold text-muted-foreground mt-1">{s.desc}</p>
                        </div>
                        <span className="font-black text-3xl">${s.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label className="font-black text-xl flex items-center gap-2">
                  <CalendarIcon size={24} className="text-playful-blue" /> Choose Arrival Date
                </Label>
                <div className="relative group">
                  <input
                    type="date"
                    onChange={(e) => setDate(e.target.value)}
                    className="playful-input w-full h-16 font-black text-2xl uppercase tracking-tighter border-black focus:bg-playful-blue/5 transition-colors"
                  />
                </div>
                <p className="text-sm font-bold text-muted-foreground italic">
                  * Arrival time for all services is 7:00 AM.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-6 sticky top-8">
            <div className="playful-card p-8 bg-playful-blue text-white space-y-8">
              <h2 className="text-3xl font-black italic flex items-center gap-3">
                <Calculator strokeWidth={3} /> SUMMARY
              </h2>
              <div className="space-y-4 font-bold border-t-4 border-black/20 pt-6">
                <div className="flex justify-between text-lg">
                  <span className="opacity-70">Buddy:</span>
                  <span>{dogs.find(d => d.id === selectedDog)?.name || '---'}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="opacity-70">Service:</span>
                  <span>{selectedService?.name || '---'}</span>
                </div>
                {selectedService && (
                  <div className="p-3 bg-black/10 rounded-xl border border-white/10 text-xs">
                    <p className="font-black uppercase tracking-widest text-[10px] mb-1 opacity-60">Check-out Rule</p>
                    <p>{selectedService.id === 'stay' ? '7:00 AM Next Day' : 
                        selectedService.id === 'daycare' ? '7:00 PM Same Day' : 
                        '30 mins post-arrival'}</p>
                  </div>
                )}
                <div className="flex justify-between text-3xl font-black border-t-4 border-black/20 pt-6 mt-6">
                  <span>TOTAL:</span>
                  <span className="text-playful-yellow">${selectedService?.price || 0}</span>
                </div>
              </div>
              <Button
                onClick={handleBooking}
                disabled={isSubmitting}
                className="playful-btn w-full bg-playful-yellow text-black border-black hover:bg-playful-yellow/90 h-16 text-xl font-black"
              >
                {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "CONFIRM BOOKING"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}