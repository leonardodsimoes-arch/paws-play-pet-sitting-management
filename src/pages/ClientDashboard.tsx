import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Dog as DogIcon, Heart, Loader2, ArrowRight, XCircle, Sparkles, CreditCard, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Dog, Booking, Invoice } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layout/AppLayout';
import { toast } from 'sonner';
export function ClientDashboard() {
  const queryClient = useQueryClient();
  const { data: dogs = [], isLoading: dogsLoading } = useQuery({
    queryKey: ['dogs'],
    queryFn: () => api<{ items: Dog[] }>('/api/dogs').then(res => res.items)
  });
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api<{ items: Booking[] }>('/api/bookings').then(res => res.items)
  });
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api<{ items: Invoice[] }>('/api/invoices').then(res => res.items)
  });
  const payMutation = useMutation({
    mutationFn: (id: string) => api(`/api/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'paid' })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success("Payment Received!", { description: "Thank you! Your fluffy credit is updated." });
    },
    onError: (err) => toast.error("Payment failed", { description: String(err) })
  });
  const handlePay = (invoiceId: string) => {
    payMutation.mutate(invoiceId);
  };
  return (
    <AppLayout container>
      <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3">
              My Fluffy Friends <Heart className="text-playful-pink fill-playful-pink" />
            </h1>
            <p className="font-bold text-muted-foreground text-lg">Manage your beloved pack</p>
          </div>
          <div className="flex gap-4">
            <Button asChild className="playful-btn bg-playful-green hover:bg-playful-green/90 text-black border-black">
              <Link to="/dogs/new"><Plus className="mr-2" /> Add Friend</Link>
            </Button>
            <Button asChild className="playful-btn bg-playful-pink hover:bg-playful-pink/90 text-white border-black">
              <Link to="/book"><Calendar className="mr-2" /> Book Service</Link>
            </Button>
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                <DogIcon className="text-playful-blue" /> Registered Buddies
              </h2>
              {dogsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[1, 2].map(i => <Skeleton key={i} className="h-48 border-4 border-black rounded-2xl" />)}
                </div>
              ) : dogs.length === 0 ? (
                <div className="playful-card p-12 text-center bg-white border-dashed border-4 flex flex-col items-center">
                  <h3 className="text-2xl font-black mb-2">The pack is empty!</h3>
                  <Button asChild className="playful-btn bg-playful-yellow text-black border-black text-lg px-10">
                    <Link to="/dogs/new">Register My First Dog</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {dogs.map((dog) => (
                    <motion.div key={dog.id} whileHover={{ scale: 1.02 }} className="playful-card p-6 space-y-4">
                      <h3 className="text-2xl font-black">{dog.name}</h3>
                      <div className="space-y-1 text-sm font-bold">
                        <p className="text-muted-foreground">Breed: <span className="text-black">{dog.breed}</span></p>
                        <p className="text-muted-foreground">Vibe: <span className="text-black capitalize">{dog.behavior}</span></p>
                      </div>
                      <Button asChild variant="outline" className="w-full border-2 border-black font-black hover:bg-playful-blue/10 rounded-xl">
                        <Link to={`/dogs/${dog.id}`}>View Details <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
            <section>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                <Calendar className="text-playful-pink" /> Upcoming Fun
              </h2>
              <div className="playful-card overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-muted border-b-4 border-black font-black text-xs uppercase">
                      <tr>
                        <th className="px-6 py-4">Friend</th>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold">
                      {bookingsLoading ? (
                        <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                      ) : bookings.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-muted-foreground italic">No fun planned yet!</td></tr>
                      ) : (
                        bookings.map((booking) => (
                          <tr key={booking.id} className="border-b-2 border-black/5 last:border-0">
                            <td className="px-6 py-4">{dogs.find(d => d.id === booking.dogId)?.name || '...'}</td>
                            <td className="px-6 py-4 capitalize">{booking.serviceType}</td>
                            <td className="px-6 py-4">{new Date(booking.startDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full border-2 border-black text-[10px] font-black uppercase ${booking.status === 'confirmed' ? 'bg-playful-green' : 'bg-playful-yellow'}`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
          <aside>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <CreditCard className="text-playful-green" /> My Bills
            </h2>
            <div className="space-y-4">
              {invoicesLoading ? <Loader2 className="animate-spin" /> : invoices.length === 0 ? (
                <div className="playful-card p-6 text-center text-muted-foreground font-bold italic">No bills yet!</div>
              ) : invoices.map(invoice => (
                <div key={invoice.id} className="playful-card p-6 bg-white space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Invoice Date</p>
                      <p className="font-bold">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-2xl font-black">${invoice.amount}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-2 border-t-2 border-black/5">
                    {invoice.status === 'paid' ? (
                      <div className="flex items-center gap-1.5 text-playful-green font-black text-xs">
                        <CheckCircle2 size={16} /> PAID
                      </div>
                    ) : (
                      <Button
                        onClick={() => handlePay(invoice.id)}
                        disabled={payMutation.isPending}
                        className="playful-btn w-full bg-playful-green text-black border-black h-10 text-sm font-black"
                      >
                        {payMutation.isPending && payMutation.variables === invoice.id ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'PAY NOW'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}