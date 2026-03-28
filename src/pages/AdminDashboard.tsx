import React from 'react';
import { LayoutDashboard, Users, AlertTriangle, Utensils, Star, Loader2, Calendar, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Dog, Booking } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
export function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: dogs = [], isLoading: dogsLoading } = useQuery({
    queryKey: ['admin-dogs'],
    queryFn: () => api<{ items: Dog[] }>('/api/dogs').then(res => res.items)
  });
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => api<{ items: Booking[] }>('/api/bookings').then(res => res.items)
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: Booking['status'] }) => api(`/api/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success(`Booking ${variables.status.toUpperCase()}!`, {
        description: `Action completed successfully for the buddy.`
      });
    },
    onError: (err) => toast.error("Update failed", { description: String(err) })
  });
  // Helper for timezone-safe local date string
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayStr = getLocalDateString();
  const activeBookings = bookings.filter(b => {
    if (b.status === 'cancelled') return false;
    const start = b.startDate?.split('T')[0];
    const end = b.endDate?.split('T')[0];
    return start === todayStr || end === todayStr;
  });
  const todayCareAlertDogs = dogs.filter(dog => {
    const isScheduledToday = activeBookings.some(b => b.dogId === dog.id);
    const hasSpecialNeeds = dog.behavior === 'reactive' || dog.behavior === 'aggressive' || (dog.instructions && dog.instructions.trim().length > 0);
    return isScheduledToday && hasSpecialNeeds;
  });
  if (dogsLoading || bookingsLoading) {
    return (
      <AppLayout container>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-playful-pink" />
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container>
      <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter flex items-center gap-3">
              ADMIN HUB <Star className="text-playful-yellow fill-playful-yellow" />
            </h1>
            <p className="font-bold text-muted-foreground text-xl">Daily Operations Dashboard</p>
          </div>
          <div className="bg-playful-blue text-white border-4 border-black px-8 py-4 rounded-3xl font-black shadow-solid flex items-center gap-3">
            <Calendar className="text-playful-yellow" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Fluffy Roster', value: dogs.length, icon: Users, color: 'bg-playful-yellow', textColor: 'text-black' },
            { label: 'Today\'s Buddies', value: activeBookings.length, icon: LayoutDashboard, color: 'bg-playful-green', textColor: 'text-black' },
            { label: 'Care Alerts', value: todayCareAlertDogs.length, icon: AlertTriangle, color: 'bg-playful-pink', textColor: 'text-white' },
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className={`playful-card p-8 ${stat.color} ${stat.textColor} flex items-center gap-6`}>
              <div className="bg-white text-black p-4 rounded-2xl border-4 border-black"><stat.icon size={32} strokeWidth={3} /></div>
              <div>
                <p className="font-black text-5xl italic leading-none">{stat.value}</p>
                <p className="font-black uppercase tracking-widest text-xs opacity-80 mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <section className="space-y-6">
            <h2 className="text-3xl font-black italic tracking-tight uppercase">Daily Schedule</h2>
            <div className="space-y-4">
              {activeBookings.length === 0 ? (
                <div className="p-8 playful-card bg-white border-dashed text-center font-bold text-muted-foreground">No activities scheduled for today.</div>
              ) : activeBookings.map(booking => {
                const dog = dogs.find(d => d.id === booking.dogId);
                const colorMap = { stay: 'bg-playful-pink', daycare: 'bg-playful-yellow', walk: 'bg-playful-blue' };
                const isArriving = booking.startDate?.split('T')[0] === todayStr;
                return (
                  <div key={booking.id} className="playful-card p-5 flex items-center justify-between bg-white group hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 ${colorMap[booking.serviceType as keyof typeof colorMap] || 'bg-muted'} border-4 border-black rounded-2xl flex items-center justify-center font-black text-2xl uppercase shadow-solid-sm group-hover:rotate-6 transition-transform`}>
                        {dog?.name?.[0] || '?'}
                      </div>
                      <div>
                        <h4 className="font-black text-xl italic uppercase tracking-tighter">{dog?.name || 'Unknown'}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{booking.serviceType}</span>
                          <span className="w-1 h-1 bg-black/20 rounded-full" />
                          <span className={`text-[10px] font-bold uppercase ${isArriving ? 'text-playful-green' : 'text-playful-pink'}`}>
                            {isArriving ? 'Arriving 7 AM' : 'Departing 7 AM'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {booking.status === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => statusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                            className="p-2 hover:bg-playful-green/20 rounded-xl transition-colors text-playful-green border-2 border-transparent hover:border-black/5"
                          >
                            <CheckCircle2 size={24} strokeWidth={3} />
                          </button>
                          <button
                            onClick={() => statusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                            className="p-2 hover:bg-playful-pink/20 rounded-xl transition-colors text-playful-pink border-2 border-transparent hover:border-black/5"
                          >
                            <XCircle size={24} strokeWidth={3} />
                          </button>
                        </div>
                      )}
                      <div className="text-right">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border-2 border-black uppercase ${booking.status === 'confirmed' ? 'bg-playful-green' : 'bg-playful-yellow'}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="space-y-6">
            <h2 className="text-3xl font-black italic tracking-tight text-playful-pink uppercase">Care & Safety Notices</h2>
            <div className="space-y-4">
              {todayCareAlertDogs.length === 0 ? (
                <div className="p-8 playful-card bg-white border-dashed text-center font-bold text-muted-foreground">All clear for today's visitors!</div>
              ) : todayCareAlertDogs.map(dog => (
                <div key={dog.id} className="playful-card p-6 border-l-[12px] border-l-playful-pink bg-white">
                  <div className="flex items-start gap-4">
                    <div className="bg-playful-pink p-3 rounded-2xl border-2 border-black shadow-solid-sm text-white">
                      <AlertTriangle size={24} strokeWidth={3} />
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-black text-2xl italic tracking-tighter uppercase">{dog.name}</h4>
                        <Link to={`/dogs/${dog.id}`} className="text-playful-blue font-black text-xs hover:underline flex items-center gap-1 uppercase">
                          View Profile <ArrowRight size={14} />
                        </Link>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(dog.behavior === 'reactive' || dog.behavior === 'aggressive') && (
                          <span className="bg-playful-pink text-white px-4 py-1 rounded-full text-[10px] font-black uppercase border-2 border-black">
                            {dog.behavior}
                          </span>
                        )}
                        <span className="bg-playful-blue/10 text-playful-blue px-4 py-1 rounded-full text-[10px] font-black border-2 border-playful-blue/20 flex items-center gap-1 uppercase">
                          <Utensils size={12} strokeWidth={3} /> Diet: {dog.diet ? dog.diet.slice(0, 20) : 'None'}...
                        </span>
                      </div>
                      <div className="bg-muted/30 border-2 border-black/5 p-4 rounded-2xl italic font-bold text-muted-foreground text-sm">
                        "{dog.instructions || 'No special instructions recorded'}"
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}