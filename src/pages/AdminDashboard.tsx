import React, { useState } from 'react';
import { LayoutDashboard, Users, AlertTriangle, Utensils, Star, Loader2, Calendar, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Dog, Booking } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
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
  const todayStart = startOfDay(new Date());
  const activeBookings = bookings.filter(b => {
    if (b.status === 'cancelled' || b.status === 'completed') return false;
    if (!b.startDate || !b.endDate) return false;
    const start = startOfDay(parseLocalISO(b.startDate));
    const end = startOfDay(parseLocalISO(b.endDate));
    return isWithinInterval(todayStart, { start, end });
  }).sort((a, b) => {
    const aEnd = parseLocalISO(a.endDate);
    const bEnd = parseLocalISO(b.endDate);
    if (isSameDay(aEnd, todayStart) && !isSameDay(bEnd, todayStart)) return -1;
    if (!isSameDay(aEnd, todayStart) && isSameDay(bEnd, todayStart)) return 1;
    return 0;
  });
  const todayCareAlertDogs = dogs.filter(dog => {
    const isScheduledToday = activeBookings.some(b => b.dogId === dog.id);
    const hasSpecialNeeds = dog.behavior === 'reactive' || dog.behavior === 'aggressive' || (dog.instructions && dog.instructions.trim().length > 0);
    return isScheduledToday && hasSpecialNeeds;
  });
  if (dogsLoading || bookingsLoading) {
    return (
      <AppLayout container>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <Loader2 className="h-16 w-16 animate-spin text-playful-pink" strokeWidth={3} />
          <p className="font-black text-xl italic animate-pulse">Waking up the pack...</p>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container>
      <div className="space-y-12 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-6xl font-black italic tracking-tighter flex items-center gap-3">
              ADMIN HUB <Star className="text-playful-yellow fill-playful-yellow shrink-0" size={48} strokeWidth={3} />
            </h1>
            <p className="font-bold text-muted-foreground text-xl">Daily Operations Dashboard</p>
          </div>
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-playful-blue text-white border-4 border-black px-8 py-5 rounded-3xl font-black shadow-solid flex items-center gap-4 text-lg"
          >
            <Calendar className="text-playful-yellow" size={28} strokeWidth={3} />
            {format(new Date(), 'EEEE, MMMM do')}
          </motion.div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Fluffy Roster', value: dogs.length, icon: Users, color: 'bg-playful-yellow', textColor: 'text-black' },
            { label: 'Today\'s Buddies', value: activeBookings.length, icon: LayoutDashboard, color: 'bg-playful-green', textColor: 'text-black' },
            { label: 'Care Alerts', value: todayCareAlertDogs.length, icon: AlertTriangle, color: 'bg-playful-pink', textColor: 'text-white' },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, rotate: -1 }}
              className={cn("playful-card p-8 flex items-center gap-6", stat.color, stat.textColor)}
            >
              <div className="bg-white text-black p-4 rounded-2xl border-4 border-black shrink-0 shadow-solid-sm"><stat.icon size={36} strokeWidth={3} /></div>
              <div>
                <p className="font-black text-6xl italic leading-none tracking-tighter">{stat.value}</p>
                <p className="font-black uppercase tracking-widest text-[10px] opacity-80 mt-2">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black italic tracking-tight uppercase flex items-center gap-3">
                <Clock className="text-playful-blue shrink-0" size={32} strokeWidth={3} /> Daily Schedule
              </h2>
              <span className="bg-black text-white px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-solid-sm">
                {activeBookings.length} Active
              </span>
            </div>
            <div className="space-y-5">
              <AnimatePresence mode="popLayout">
                {activeBookings.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 playful-card bg-white border-dashed text-center font-bold text-muted-foreground border-4 border-black"
                  >
                    No activities scheduled for today.
                  </motion.div>
                ) : activeBookings.map(booking => {
                  const dog = dogs.find(d => d.id === booking.dogId);
                  const start = startOfDay(parseLocalISO(booking.startDate));
                  const end = startOfDay(parseLocalISO(booking.endDate));
                  let statusLabel = 'In House';
                  let timeInfo = '';
                  let statusColor = 'bg-playful-blue text-white';
                  if (booking.serviceType === 'daycare' || booking.serviceType === 'walk') {
                    statusLabel = 'Daily';
                    timeInfo = booking.serviceType === 'walk' ? 'Walkie' : '7 AM - 7 PM';
                    statusColor = 'bg-playful-green text-black';
                  } else if (isSameDay(end, todayStart)) {
                    statusLabel = 'Departing';
                    timeInfo = '7:00 AM';
                    statusColor = 'bg-playful-pink text-white';
                  } else if (isSameDay(start, todayStart)) {
                    statusLabel = 'Arriving';
                    timeInfo = '7:00 AM';
                    statusColor = 'bg-playful-blue text-white';
                  }
                  return (
                    <motion.div 
                      layout
                      key={booking.id} 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="playful-card p-6 bg-white group hover:shadow-solid-lg transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "w-16 h-16 border-4 border-black rounded-2xl flex items-center justify-center font-black text-2xl uppercase shadow-solid-sm group-hover:rotate-6 transition-transform",
                            booking.serviceType === 'stay' ? 'bg-playful-pink' : booking.serviceType === 'daycare' ? 'bg-playful-yellow' : 'bg-playful-blue'
                          )}>
                            {dog?.name?.[0] || '?'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-2xl italic uppercase tracking-tighter truncate max-w-[180px]">{dog?.name || 'Unknown Friend'}</h4>
                            <span className={cn("text-[11px] font-black px-3 py-1 rounded-full border-2 border-black uppercase whitespace-nowrap shadow-solid-sm inline-block mt-1", statusColor)}>
                              {statusLabel} {timeInfo}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-2">
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => statusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                                className="p-2 bg-playful-green/10 hover:bg-playful-green border-2 border-black rounded-xl transition-all hover:shadow-solid-sm active:translate-y-0.5"
                              >
                                <CheckCircle2 className="w-6 h-6 text-playful-green group-hover:text-black transition-colors" strokeWidth={3} />
                              </button>
                            )}
                            <button
                              onClick={() => setCancelBookingId(booking.id)}
                              className="p-2 bg-playful-pink/10 hover:bg-playful-pink border-2 border-black rounded-xl transition-all hover:shadow-solid-sm active:translate-y-0.5"
                            >
                              <XCircle className="w-6 h-6 text-playful-pink group-hover:text-white transition-colors" strokeWidth={3} />
                            </button>
                          </div>
                          <span className="text-[10px] font-black border-black/30 border-2 rounded-full px-2 py-0.5 uppercase opacity-60 bg-muted/50">{booking.status}</span>
                        </div>
                      </div>
                      {dog?.instructions && (
                        <div className="bg-playful-yellow border-2 border-black p-3 rounded-2xl text-xs font-bold italic text-black flex items-center gap-3">
                          <Utensils size={16} className="shrink-0" />
                          <span className="truncate">{dog.instructions}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>
          {todayCareAlertDogs.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-3xl font-black italic tracking-tight text-playful-pink uppercase flex items-center gap-3">
                <AlertTriangle className="shrink-0" size={32} strokeWidth={3} /> Care Notices
              </h2>
              <div className="space-y-6">
                {todayCareAlertDogs.map((dog, i) => (
                  <motion.div 
                    key={dog.id} 
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="playful-card p-6 border-l-[16px] border-l-playful-pink bg-white shadow-solid relative overflow-hidden"
                  >
                    <div className="flex items-start gap-5">
                      <div className="bg-playful-pink p-4 rounded-2xl border-4 border-black shadow-solid-sm text-white shrink-0">
                        <AlertTriangle size={32} strokeWidth={3} />
                      </div>
                      <div className="space-y-4 flex-1 min-w-0">
                        <div className="flex justify-between items-center gap-2">
                          <h4 className="font-black text-3xl italic tracking-tighter uppercase truncate leading-none">{dog.name || 'Anonymous'}</h4>
                          <Link to={`/dogs/${dog.id}`} className="text-playful-blue font-black text-xs hover:underline flex items-center gap-2 uppercase shrink-0 transition-all hover:scale-110">
                            Profile <ArrowRight size={16} strokeWidth={3} />
                          </Link>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(dog.behavior === 'reactive' || dog.behavior === 'aggressive') && (
                            <span className="bg-playful-pink text-white px-4 py-1 rounded-full text-[11px] font-black uppercase border-2 border-black shadow-solid-sm">
                              {dog.behavior}
                            </span>
                          )}
                          <span className="bg-playful-blue/10 text-playful-blue px-4 py-1 rounded-full text-[11px] font-black border-2 border-playful-blue/20 flex items-center gap-2 uppercase">
                            <Utensils size={14} strokeWidth={3} /> {dog.diet ? (dog.diet.length > 30 ? dog.diet.slice(0, 30) + '...' : dog.diet) : 'Standard'}
                          </span>
                        </div>
                        <div className="bg-muted/30 border-4 border-black p-5 rounded-2xl italic font-bold text-muted-foreground text-sm leading-relaxed">
                          "{dog.instructions || 'No special instructions recorded'}"
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <AlertDialog open={!!cancelBookingId} onOpenChange={(open) => !open && setCancelBookingId(null)}>
        <AlertDialogContent className="bg-white border-4 border-black rounded-[2.5rem] shadow-solid-lg p-10 max-w-lg">
          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="text-4xl font-black italic tracking-tighter uppercase text-playful-pink">Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription className="text-xl font-bold text-muted-foreground leading-snug">
              This will remove the buddy from today's active schedule. This action is final for today!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-6 mt-10">
            <AlertDialogCancel className="playful-btn bg-white border-black text-black h-16 text-xl flex-1 shadow-solid hover:translate-y-0.5 active:translate-y-1">Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelBookingId && statusMutation.mutate({ id: cancelBookingId, status: 'cancelled' })}
              className="playful-btn bg-playful-pink text-white border-black hover:bg-playful-pink/90 h-16 text-xl flex-1 shadow-solid hover:translate-y-0.5 active:translate-y-1"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}