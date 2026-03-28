import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Dog as DogIcon, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Dog, Booking } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layout/AppLayout';
export function ClientDashboard() {
  const { data: dogs = [], isLoading: dogsLoading } = useQuery({
    queryKey: ['dogs'],
    queryFn: () => api<{ items: Dog[] }>('/api/dogs').then(res => res.items)
  });
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api<{ items: Booking[] }>('/api/bookings').then(res => res.items)
  });
  return (
    <AppLayout container>
      <div className="space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3">
              My Fluffy Friends <Heart className="text-playful-pink fill-playful-pink" />
            </h1>
            <p className="font-bold text-muted-foreground">Manage your beloved pack</p>
          </div>
          <div className="flex gap-4">
            <Button asChild className="playful-btn bg-playful-green hover:bg-playful-green/90 text-black">
              <Link to="/dogs/new"><Plus className="mr-2" /> Add Friend</Link>
            </Button>
            <Button asChild className="playful-btn bg-playful-pink hover:bg-playful-pink/90 text-white">
              <Link to="/book"><Calendar className="mr-2" /> Book Service</Link>
            </Button>
          </div>
        </header>
        <section>
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <DogIcon className="text-playful-blue" /> Registered Buddies
          </h2>
          {dogsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 border-4 border-black rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {dogs.map((dog) => (
                <motion.div
                  key={dog.id}
                  whileHover={{ scale: 1.02 }}
                  className="playful-card p-6 space-y-4 overflow-hidden relative"
                >
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-playful-yellow/20 rounded-full" />
                  <h3 className="text-2xl font-black">{dog.name}</h3>
                  <div className="space-y-1 text-sm font-bold">
                    <p className="text-muted-foreground">Breed: <span className="text-black">{dog.breed}</span></p>
                    <p className="text-muted-foreground">Age: <span className="text-black">{dog.age} years</span></p>
                    <p className="text-muted-foreground">Vibe: <span className="text-black capitalize">{dog.behavior}</span></p>
                  </div>
                  <Button variant="outline" className="w-full border-2 border-black font-bold hover:bg-playful-blue/10">Edit Profile</Button>
                </motion.div>
              ))}
            </div>
          )}
        </section>
        <section>
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <Calendar className="text-playful-pink" /> Upcoming Fun
          </h2>
          <div className="playful-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted border-b-4 border-black font-black">
                  <tr>
                    <th className="px-6 py-4">Friend</th>
                    <th className="px-6 py-4">Fluffy Service</th>
                    <th className="px-6 py-4">Dates</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="font-bold">
                  {bookingsLoading ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                  ) : bookings.map((booking) => {
                    const dog = dogs.find(d => d.id === booking.dogId);
                    return (
                      <tr key={booking.id} className="border-b-2 border-black/5 last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">{dog?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 capitalize">{booking.serviceType}</td>
                        <td className="px-6 py-4">{new Date(booking.startDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full border-2 border-black text-xs uppercase font-black ${
                            booking.status === 'confirmed' ? 'bg-playful-green' : 'bg-playful-yellow'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}