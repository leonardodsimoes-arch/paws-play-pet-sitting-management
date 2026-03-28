import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Dog, Booking } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Dog as DogIcon, ShieldCheck, Heart, Utensils, AlertTriangle, Calendar, Loader2, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
export function DogDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: dog, isLoading: dogLoading } = useQuery({
    queryKey: ['dog', id],
    queryFn: () => api<Dog>(`/api/dogs/${id}`)
  });
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['dog-bookings', id],
    queryFn: () => api<{ items: Booking[] }>(`/api/bookings`).then(res => res.items.filter(b => b.dogId === id))
  });
  if (dogLoading) {
    return (
      <AppLayout container>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-playful-pink" />
          <p className="font-black text-xl italic">Fetching your buddy's profile...</p>
        </div>
      </AppLayout>
    );
  }
  if (!dog) return <div className="p-8 font-black text-center text-3xl">Buddy not found!</div>;
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="font-black hover:bg-playful-yellow/20">
            <ChevronLeft className="mr-2" /> Back to Pack
          </Button>
          <Button asChild className="playful-btn bg-playful-yellow text-black border-black">
            <Link to="/book">Book for {dog.name}</Link>
          </Button>
        </div>
        <header className="relative py-12 px-8 playful-card bg-playful-blue text-white overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <DogIcon size={200} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="w-32 h-32 bg-white border-4 border-black rounded-3xl flex items-center justify-center shadow-solid-sm rotate-3">
              <DogIcon size={64} className="text-playful-blue" strokeWidth={3} />
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter">{dog.name}</h1>
              <p className="text-xl font-bold opacity-90">{dog.breed} • {dog.age} Years Old • {dog.weight}kg</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
                <span className="bg-white text-playful-blue px-4 py-1 rounded-full text-xs font-black uppercase border-2 border-black">
                  {dog.behavior}
                </span>
                {dog.vaccinesUpToDate && (
                  <span className="bg-playful-green text-black px-4 py-1 rounded-full text-xs font-black uppercase border-2 border-black flex items-center gap-1">
                    <ShieldCheck size={14} /> Fully Vaxxed
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <section className="playful-card p-8 space-y-4 bg-white">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <Utensils className="text-playful-pink" /> Feeding & Care
              </h2>
              <div className="space-y-4 font-bold">
                <div className="p-4 bg-muted/30 border-2 border-black/5 rounded-xl italic">
                  "{dog.diet || 'No specific diet recorded'}"
                </div>
                {dog.instructions && (
                  <div className="space-y-2">
                    <p className="text-sm uppercase text-muted-foreground tracking-widest font-black">Special Instructions</p>
                    <p className="text-lg">{dog.instructions}</p>
                  </div>
                )}
              </div>
            </section>
            <section className="playful-card p-8 bg-playful-yellow border-black text-black text-center space-y-4">
              <Heart size={48} className="mx-auto fill-playful-pink text-black" />
              <h3 className="text-2xl font-black">Pack Status: Elite</h3>
              <p className="font-bold">{dog.name} is a valued member of the Fluffy pack!</p>
            </section>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
            <section className="playful-card p-8 bg-white space-y-6">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <Calendar className="text-playful-blue" /> Adventure History
              </h2>
              {bookingsLoading ? (
                <Loader2 className="animate-spin text-playful-pink" />
              ) : bookings.length === 0 ? (
                <p className="font-bold text-muted-foreground italic">No past adventures yet.</p>
              ) : (
                <div className="space-y-4">
                  {bookings.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(booking => {
                    const start = parseISO(booking.startDate);
                    const end = parseISO(booking.endDate);
                    const dateRange = format(start, 'MMM d') + (booking.serviceType !== 'walk' ? ` - ${format(end, 'MMM d, yyyy')}` : `, ${format(start, 'yyyy')}`);
                    return (
                      <div key={booking.id} className="p-5 border-4 border-black rounded-2xl flex justify-between items-center font-bold bg-white shadow-solid-sm">
                        <div className="space-y-1">
                          <p className="capitalize text-xl font-black italic tracking-tight">{booking.serviceType}</p>
                          <p className="text-xs text-muted-foreground font-black uppercase tracking-wider">{dateRange}</p>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="flex items-center gap-1 justify-end font-black text-playful-green">
                             <CreditCard size={14} /> ${booking.total}
                          </div>
                          <span className={`block text-[10px] font-black px-2 py-0.5 rounded border-2 border-black uppercase ${booking.status === 'confirmed' ? 'bg-playful-green' : 'bg-playful-yellow'}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
            <section className="playful-card p-8 space-y-4 bg-playful-pink/5 border-playful-pink">
              <h2 className="text-2xl font-black flex items-center gap-3 text-playful-pink">
                <AlertTriangle /> Personality Notes
              </h2>
              <div className="font-bold space-y-2 text-lg">
                <p>Social Style: <span className="capitalize font-black text-playful-pink">{dog.behavior}</span></p>
                <p className="text-muted-foreground text-sm font-bold">
                  {dog.behavior === 'friendly' ? 'Loves meeting new friends!' :
                   dog.behavior === 'shy' ? 'Needs a little time to warm up.' :
                   'Requires experienced handling and individual space.'}
                </p>
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}