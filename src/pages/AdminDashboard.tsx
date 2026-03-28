import React from 'react';
import { LayoutDashboard, Users, AlertTriangle, Utensils, Star, Loader2, Calendar, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Dog, Booking } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
export function AdminDashboard() {
  const { data: dogs = [], isLoading: dogsLoading } = useQuery({
    queryKey: ['admin-dogs'],
    queryFn: () => api<{ items: Dog[] }>('/api/dogs').then(res => res.items)
  });
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => api<{ items: Booking[] }>('/api/bookings').then(res => res.items)
  });
  const today = new Date().toISOString().split('T')[0];
  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.startDate.startsWith(today));
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
      <div className="space-y-12">
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
            { label: 'Fluffy Roster', value: dogs.length, icon: Users, color: 'bg-playful-yellow' },
            { label: 'Today\'s Buddies', value: activeBookings.length, icon: LayoutDashboard, color: 'bg-playful-green' },
            { label: 'Care Alerts', value: dogs.filter(d => d.behavior === 'reactive').length, icon: AlertTriangle, color: 'bg-playful-pink' },
          ].map((stat, i) => (stat.label === 'Care Alerts' ? (
            <motion.div key={i} whileHover={{ y: -4 }} className={`playful-card p-8 ${stat.color} text-white flex items-center gap-6`}>
              <div className="bg-white text-black p-4 rounded-2xl border-4 border-black"><stat.icon size={32} /></div>
              <div>
                <p className="font-black text-5xl italic">{stat.value}</p>
                <p className="font-black uppercase tracking-widest text-xs opacity-80">{stat.label}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key={i} whileHover={{ y: -4 }} className={`playful-card p-8 ${stat.color} flex items-center gap-6`}>
              <div className="bg-black text-white p-4 rounded-2xl border-4 border-black"><stat.icon size={32} /></div>
              <div>
                <p className="font-black text-5xl italic">{stat.value}</p>
                <p className="font-black uppercase tracking-widest text-xs opacity-80">{stat.label}</p>
              </div>
            </motion.div>
          )))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <section className="space-y-6">
            <h2 className="text-3xl font-black italic tracking-tight">DAILY SCHEDULE</h2>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="p-8 playful-card bg-white border-dashed text-center font-bold text-muted-foreground">No activities scheduled.</div>
              ) : bookings.map(booking => {
                const dog = dogs.find(d => d.id === booking.dogId);
                const colorMap = { stay: 'bg-playful-pink', daycare: 'bg-playful-yellow', walk: 'bg-playful-blue' };
                return (
                  <div key={booking.id} className="playful-card p-5 flex items-center justify-between bg-white group hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 ${colorMap[booking.serviceType as keyof typeof colorMap] || 'bg-muted'} border-4 border-black rounded-2xl flex items-center justify-center font-black text-2xl uppercase shadow-solid-sm group-hover:rotate-6 transition-transform`}>
                        {dog?.name[0] || '?'}
                      </div>
                      <div>
                        <h4 className="font-black text-xl italic uppercase tracking-tighter">{dog?.name || 'Unknown'}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{booking.serviceType}</span>
                          <span className="w-1 h-1 bg-black/20 rounded-full" />
                          <span className="text-xs font-bold text-playful-blue uppercase">Arriving 7 AM</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm italic">{new Date(booking.startDate).toLocaleDateString()}</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border-2 border-black uppercase ${booking.status === 'confirmed' ? 'bg-playful-green' : 'bg-playful-yellow'}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="space-y-6">
            <h2 className="text-3xl font-black italic tracking-tight text-playful-pink uppercase">Care & Safety Notices</h2>
            <div className="space-y-4">
              {dogs.filter(d => d.behavior === 'reactive' || d.instructions).map(dog => (
                <div key={dog.id} className="playful-card p-6 border-l-[12px] border-l-playful-pink bg-white">
                  <div className="flex items-start gap-4">
                    <div className="bg-playful-pink p-3 rounded-2xl border-2 border-black shadow-solid-sm text-white">
                      <AlertTriangle size={24} />
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-black text-2xl italic tracking-tighter uppercase">{dog.name}</h4>
                        <Link to={`/dogs/${dog.id}`} className="text-playful-blue font-black text-xs hover:underline flex items-center gap-1 uppercase">
                          View Profile <ArrowRight size={14} />
                        </Link>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {dog.behavior === 'reactive' && (
                          <span className="bg-playful-pink text-white px-4 py-1 rounded-full text-[10px] font-black uppercase border-2 border-black">Reactive</span>
                        )}
                        <span className="bg-playful-blue/10 text-playful-blue px-4 py-1 rounded-full text-[10px] font-black border-2 border-playful-blue/20 flex items-center gap-1 uppercase">
                          <Utensils size={12} /> Diet: {dog.diet.slice(0, 15)}...
                        </span>
                      </div>
                      <div className="bg-muted/30 border-2 border-black/5 p-4 rounded-2xl italic font-bold text-muted-foreground">
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