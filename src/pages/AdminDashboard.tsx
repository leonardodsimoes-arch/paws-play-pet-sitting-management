import React, { useState } from 'react';
import { LayoutDashboard, Users, AlertTriangle, Utensils, Star, Loader2, Calendar, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Dog, Booking } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { isWithinInterval, startOfDay, format, isSameDay } from 'date-fns';
import { cn, parseLocalISO } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
export function AdminDashboard() {
  const queryClient = useQueryClient();
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
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
      toast.success(`Booking ${variables.status.toUpperCase()}!`);
      setCancelBookingId(null);
    },
    onError: (err) => toast.error("Update failed", { description: String(err) })
  });
  const today = startOfDay(new Date());
  const activeBookings = bookings.filter(b => {
    if (b.status === 'cancelled') return false;
    if (!b.startDate || !b.endDate) return false;
    const start = startOfDay(parseLocalISO(b.startDate));
    const end = startOfDay(parseLocalISO(b.endDate));
    return isWithinInterval(today, { start, end });
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
          <Loader2 className="h-12 w-12 animate-spin text-playful-pink" strokeWidth={3} />
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container>
      <div className="space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter flex items-center gap-3">
              ADMIN HUB <Star className="text-playful-yellow fill-playful-yellow" strokeWidth={3} />
            </h1>
            <p className="font-bold text-muted-foreground text-xl">Daily Operations Dashboard</p>
          </div>
          <div className="bg-playful-blue text-white border-4 border-black px-8 py-4 rounded-3xl font-black shadow-solid flex items-center gap-3">
            <Calendar className="text-playful-yellow" strokeWidth={3} />
            {format(new Date(), 'EEEE, MMMM do')}
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Fluffy Roster', value: dogs.length, icon: Users, color: 'bg-playful-yellow', textColor: 'text-black' },
            { label: 'Today\'s Buddies', value: activeBookings.length, icon: LayoutDashboard, color: 'bg-playful-green', textColor: 'text-black' },
            { label: 'Care Alerts', value: todayCareAlertDogs.length, icon: AlertTriangle, color: 'bg-playful-pink', textColor: 'text-white' },
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className={`playful-card p-8 ${stat.color} ${stat.textColor} flex items-center gap-6`}>
              <div className="bg-white text-black p-4 rounded-2xl border-4 border-black shrink-0"><stat.icon size={32} strokeWidth={3} /></div>
              <div>
                <p className="font-black text-5xl italic leading-none">{stat.value}</p>
                <p className="font-black uppercase tracking-widest text-xs opacity-80 mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black italic tracking-tight uppercase flex items-center gap-2">
                <Clock className="text-playful-blue" strokeWidth={3} /> Daily Schedule
              </h2>
              <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {activeBookings.length} Scheduled
              </span>
            </div>
            <div className="space-y-4">
              {activeBookings.length === 0 ? (
                <div className="p-8 playful-card bg-white border-dashed text-center font-bold text-muted-foreground border-4 border-black">No activities scheduled for today.</div>
              ) : activeBookings.map(booking => {
                const dog = dogs.find(d => d.id === booking.dogId);
                const start = startOfDay(parseLocalISO(booking.startDate));
                const end = startOfDay(parseLocalISO(booking.endDate));
                let statusLabel = 'In House';
                let timeInfo = '';
                let statusColor = 'bg-playful-blue text-white';
                if (booking.serviceType === 'daycare' || booking.serviceType === 'walk') {
                  statusLabel = 'Full Day';
                  timeInfo = '7 AM - 7 PM';
                  statusColor = 'bg-playful-green text-black';
                } else if (isSameDay(start, today)) {
                  statusLabel = 'Arriving';
                  timeInfo = '7:00 AM';
                  statusColor = 'bg-playful-blue text-white';
                } else if (isSameDay(end, today)) {
                  statusLabel = 'Departing';
                  timeInfo = '7:00 AM';
                  statusColor = 'bg-playful-pink text-white';
                }
                return (
                  <div key={booking.id} className="playful-card p-5 flex items-center justify-between bg-white group hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-14 h-14 border-4 border-black rounded-2xl flex items-center justify-center font-black text-2xl uppercase shadow-solid-sm group-hover:rotate-6 transition-transform",
                        booking.serviceType === 'stay' ? 'bg-playful-pink' : booking.serviceType === 'daycare' ? 'bg-playful-yellow' : 'bg-playful-blue'
                      )}>
                        {dog?.name?.[0] || '?'}
                      </div>
                      <div>
                        <h4 className="font-black text-xl italic uppercase tracking-tighter truncate max-w-[150px]">{dog?.name || 'Unknown Friend'}</h4>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{booking.serviceType}</span>
                          <span className={cn("text-[10px] font-black px-2 py-0.5 rounded border-2 border-black uppercase whitespace-nowrap", statusColor)}>
                            {statusLabel} {timeInfo}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {booking.status === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => statusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                            className="p-2 hover:bg-playful-green/20 rounded-xl transition-colors text-playful-green"
                            title="Confirm Arrival"
                          >
                            <CheckCircle2 size={24} strokeWidth={3} />
                          </button>
                          <button
                            onClick={() => setCancelBookingId(booking.id)}
                            className="p-2 hover:bg-playful-pink/20 rounded-xl transition-colors text-playful-pink"
                            title="Cancel Booking"
                          >
                            <XCircle size={24} strokeWidth={3} />
                          </button>
                        </div>
                      )}
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded border-2 border-black uppercase",
                        booking.status === 'confirmed' ? 'bg-playful-green text-black' : 'bg-playful-yellow text-black'
                      )}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          {todayCareAlertDogs.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-3xl font-black italic tracking-tight text-playful-pink uppercase flex items-center gap-2">
                <AlertTriangle strokeWidth={3} /> Care Notices
              </h2>
              <div className="space-y-4">
                {todayCareAlertDogs.map(dog => (
                  <div key={dog.id} className="playful-card p-6 border-l-[12px] border-l-playful-pink bg-white">
                    <div className="flex items-start gap-4">
                      <div className="bg-playful-pink p-3 rounded-2xl border-2 border-black shadow-solid-sm text-white shrink-0">
                        <AlertTriangle size={24} strokeWidth={3} />
                      </div>
                      <div className="space-y-4 flex-1 min-w-0">
                        <div className="flex justify-between items-center gap-2">
                          <h4 className="font-black text-2xl italic tracking-tighter uppercase truncate">{dog.name || 'Anonymous'}</h4>
                          <Link to={`/dogs/${dog.id}`} className="text-playful-blue font-black text-xs hover:underline flex items-center gap-1 uppercase shrink-0">
                            Profile <ArrowRight size={14} strokeWidth={3} />
                          </Link>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(dog.behavior === 'reactive' || dog.behavior === 'aggressive') && (
                            <span className="bg-playful-pink text-white px-3 py-1 rounded-full text-[10px] font-black uppercase border-2 border-black">
                              {dog.behavior}
                            </span>
                          )}
                          <span className="bg-playful-blue/10 text-playful-blue px-3 py-1 rounded-full text-[10px] font-black border-2 border-playful-blue/20 flex items-center gap-1 uppercase">
                            <Utensils size={12} strokeWidth={3} /> {dog.diet ? (dog.diet.length > 20 ? dog.diet.slice(0, 20) + '...' : dog.diet) : 'Standard'}
                          </span>
                        </div>
                        <div className="bg-muted/30 border-4 border-black p-4 rounded-2xl italic font-bold text-muted-foreground text-sm">
                          "{dog.instructions || 'No special instructions recorded'}"
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <AlertDialog open={!!cancelBookingId} onOpenChange={(open) => !open && setCancelBookingId(null)}>
        <AlertDialogContent className="bg-white border-4 border-black rounded-3xl shadow-solid-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black italic tracking-tight uppercase">Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-bold text-muted-foreground">
              This will remove the buddy from the daily schedule. This action is not reversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-4">
            <AlertDialogCancel className="playful-btn bg-white border-black text-black">Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelBookingId && statusMutation.mutate({ id: cancelBookingId, status: 'cancelled' })}
              className="playful-btn bg-playful-pink text-white border-black hover:bg-playful-pink/90"
            >
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}