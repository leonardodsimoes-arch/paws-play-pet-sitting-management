import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Loader2, Clock, CalendarIcon, Dog as DogIcon, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Dog as DogType } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { cn, parseLocalISO } from '@/lib/utils';
import { useAuthStore } from '@/store/use-auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import { differenceInDays } from 'date-fns';
export function BookingFlow() {
  const navigate = useNavigate();
  const userId = useAuthStore(s => s.user?.id);
  const [selectedDog, setSelectedDog] = useState('');
  const [service, setService] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [walkDuration, setWalkDuration] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: dogs = [], isLoading: loadingDogs } = useQuery({
    queryKey: ['dogs'],
    queryFn: () => api<{ items: DogType[] }>('/api/dogs').then(res => res.items)
  });
  const services = [
    { id: 'stay', name: 'Basic Stay', price: 45, time: '7 AM - 7 AM', desc: 'Overnight Boarding' },
    { id: 'daycare', name: 'Daycare', price: 30, time: '7 AM - 7 PM', desc: 'Full Day Play' },
    { id: 'walk', name: 'Dog Walk', price: 15, time: '30/60 mins', desc: 'Neighborhood Stroll' },
  ];
  const calculation = useMemo(() => {
    if (!service || !checkInDate) return { total: 0, units: 0, label: '', isValid: false };
    if (service === 'walk') {
      const price = walkDuration === '60' ? 25 : 15;
      return { total: price, units: 1, label: walkDuration === '60' ? '60 min walk' : '30 min walk', isValid: true };
    }
    if (!checkOutDate) return { total: 0, units: 0, label: 'Waiting for checkout...', isValid: false };
    const start = parseLocalISO(checkInDate);
    const end = parseLocalISO(checkOutDate);
    const days = differenceInDays(end, start);
    if (service === 'stay') {
      if (days < 1) return { total: 0, units: 0, label: 'Invalid Range', isValid: false };
      return { total: days * 45, units: days, label: `${days} Night${days > 1 ? 's' : ''}`, isValid: true };
    }
    if (service === 'daycare') {
      const dayCount = Math.max(1, days + 1);
      return { total: dayCount * 30, units: dayCount, label: `${dayCount} Day${dayCount > 1 ? 's' : ''}`, isValid: true };
    }
    return { total: 0, units: 0, label: '', isValid: false };
  }, [service, checkInDate, checkOutDate, walkDuration]);
  const handleBooking = async () => {
    if (!selectedDog || !service || !checkInDate) {
      toast.error("Oops!", { description: "Please fill in all details first." });
      return;
    }
    if (service === 'stay' && (!checkOutDate || differenceInDays(parseLocalISO(checkOutDate), parseLocalISO(checkInDate)) < 1)) {
      toast.error("Invalid Stay", {
        description: "Boarding requires at least one night (Check-out must be after Check-in day).",
        icon: <AlertCircle className="text-playful-pink" />
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const startDateStr = `${checkInDate}T07:00:00`;
      let endDateStr = startDateStr;
      if (service === 'stay') {
        endDateStr = `${checkOutDate}T07:00:00`;
      } else if (service === 'daycare') {
        endDateStr = `${checkOutDate}T19:00:00`;
      } else if (service === 'walk') {
        endDateStr = `${checkInDate}T07:30:00`;
      }
      await api('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          dogId: selectedDog,
          ownerId: userId,
          serviceType: service,
          startDate: startDateStr,
          endDate: endDateStr,
          total: calculation.total
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
  const isFormComplete = !!(selectedDog && service && checkInDate && calculation.isValid);
  const selectedServiceData = services.find(s => s.id === service);
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
                  <DogIcon size={24} className="text-playful-pink" strokeWidth={3} /> Who is visiting?
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
                      type="button"
                      onClick={() => {
                        setService(s.id);
                        if (s.id === 'walk') setCheckOutDate('');
                      }}
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
                              <Clock size={10} strokeWidth={3} /> {s.time}
                            </span>
                          </div>
                          <p className="font-bold text-muted-foreground mt-1">{s.desc}</p>
                        </div>
                        <span className="font-black text-3xl">
                          {s.id === 'walk' ? '$15+' : `${s.price}`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {service && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="font-black text-xl flex items-center gap-2">
                        <CalendarIcon size={24} className="text-playful-blue" strokeWidth={3} /> {service === 'walk' ? 'Date' : 'Check-in Date'}
                      </Label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="playful-input w-full h-14 font-black border-black bg-white"
                      />
                    </div>
                    {service !== 'walk' ? (
                      <div className="space-y-3">
                        <Label className="font-black text-xl flex items-center gap-2">
                          <ArrowRight size={24} className="text-playful-green" strokeWidth={3} /> Check-out Date
                        </Label>
                        <input
                          type="date"
                          min={checkInDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          className="playful-input w-full h-14 font-black border-black bg-white"
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Label className="font-black text-xl flex items-center gap-2">
                          <Clock size={24} className="text-playful-pink" strokeWidth={3} /> Duration
                        </Label>
                        <Select onValueChange={setWalkDuration} defaultValue="30">
                          <SelectTrigger className="playful-input h-14 font-black border-black bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-4 border-black rounded-xl">
                            <SelectItem value="30" className="font-black">30 Minutes ($15)</SelectItem>
                            <SelectItem value="60" className="font-black">60 Minutes ($25)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          <div className="space-y-6 lg:sticky lg:top-8">
            <motion.div 
              layout
              className="playful-card p-8 bg-playful-blue text-white space-y-8 border-4 border-black shadow-solid"
            >
              <h2 className="text-3xl font-black italic flex items-center gap-3">
                <Calculator strokeWidth={3} /> SUMMARY
              </h2>
              <div className="space-y-6 font-bold border-t-4 border-black/20 pt-6">
                <div className="flex justify-between text-lg items-center">
                  <span className="opacity-70 text-sm uppercase tracking-widest font-black">Buddy</span>
                  <span className="italic truncate max-w-[120px]">{dogs.find(d => d.id === selectedDog)?.name || '---'}</span>
                </div>
                <div className="flex justify-between text-lg items-center">
                  <span className="opacity-70 text-sm uppercase tracking-widest font-black">Service</span>
                  <span className="italic uppercase tracking-tighter font-black">{selectedServiceData?.name || '---'}</span>
                </div>
                <AnimatePresence mode="wait">
                  {calculation.label && (
                    <motion.div 
                      key={calculation.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex justify-between text-lg items-center"
                    >
                      <span className="opacity-70 text-sm uppercase tracking-widest font-black">Details</span>
                      <span className={cn("italic", !calculation.isValid && "text-playful-yellow text-xs")}>{calculation.label}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex justify-between font-black border-t-4 border-black/20 pt-6 mt-6">
                  <span className="text-3xl italic tracking-tighter">TOTAL</span>
                  <span className="text-4xl text-playful-yellow">
                    {calculation.total > 0 ? `$${calculation.total}` : '---'}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleBooking}
                disabled={!isFormComplete || isSubmitting}
                className={cn(
                  "playful-btn w-full text-black border-black h-16 text-xl font-black transition-all",
                  isFormComplete ? "bg-playful-yellow hover:bg-playful-yellow/90" : "bg-muted text-muted-foreground opacity-50"
                )}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "CONFIRM BOOKING"}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}