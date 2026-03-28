import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Dog as DogIcon, Heart, Loader2, ArrowRight, Sparkles, CreditCard, CheckCircle2 } from 'lucide-react';
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
      toast.success("Payment Received!", { description: "Thank you! Your fluffy credit is updated.", icon: <Sparkles className="text-playful-yellow" /> });
    },
    onError: (err) => toast.error("Payment failed", { description: String(err) })
  });
  const handlePay = (invoiceId: string) => {
    payMutation.mutate(invoiceId);
  };
  return (
    <AppLayout container>
      <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter flex items-center gap-3">
              MY FRIENDS <Heart className="text-playful-pink fill-playful-pink" strokeWidth={3} />
            </h1>
            <p className="font-bold text-muted-foreground text-xl">Manage your beloved fluffy pack</p>
          </div>
          <div className="flex gap-4">
            <Button asChild className="playful-btn bg-playful-green hover:bg-playful-green/90 text-black border-black h-14">
              <Link to="/dogs/new"><Plus className="mr-2" strokeWidth={3} /> Add Friend</Link>
            </Button>
            <Button asChild className="playful-btn bg-playful-pink hover:bg-playful-pink/90 text-white border-black h-14">
              <Link to="/book"><Calendar className="mr-2" strokeWidth={3} /> Book Service</Link>
            </Button>
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-black mb-6 flex items-center gap-3 italic uppercase tracking-tight">
                <DogIcon className="text-playful-blue" strokeWidth={3} /> Registered Buddies
              </h2>
              {dogsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[1, 2].map(i => <Skeleton key={i} className="h-48 border-4 border-black rounded-2xl" />)}
                </div>
              ) : dogs.length === 0 ? (
                <div className="playful-card p-12 text-center bg-white border-dashed border-4 flex flex-col items-center">
                  <h3 className="text-2xl font-black mb-4">The pack is empty!</h3>
                  <Button asChild className="playful-btn bg-playful-yellow text-black border-black text-lg px-10 h-14">
                    <Link to="/dogs/new">Register My First Dog</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {dogs.map((dog) => (
                    <motion.div key={dog.id} whileHover={{ y: -4 }} className="playful-card p-6 space-y-6 bg-white border-4 border-black">
                      <div className="flex justify-between items-start">
                        <div className="w-14 h-14 rounded-2xl bg-playful-yellow border-4 border-black flex items-center justify-center rotate-3 shadow-solid-sm">
                          <DogIcon className="h-8 w-8 text-black" strokeWidth={3} />
                        </div>
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase">{dog.name}</h3>
                      </div>
                      <div className="space-y-2 text-sm font-bold pt-2 border-t-2 border-black/5">
                        <p className="text-muted-foreground uppercase tracking-widest text-[10px]">Breed</p>
                        <p className="text-black font-black text-lg italic tracking-tight">{dog.breed}</p>
                        <p className="text-muted-foreground uppercase tracking-widest text-[10px] mt-2">Personality</p>
                        <p className="text-black font-black uppercase">{dog.behavior}</p>
                      </div>
                      <Button asChild className="w-full playful-btn bg-playful-blue text-white border-black h-12 text-sm font-black shadow-solid-sm">
                        <Link to={`/dogs/${dog.id}`}>View Profile <ArrowRight className="ml-2 h-4 w-4" strokeWidth={3} /></Link>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
            <section>
              <h2 className="text-3xl font-black mb-6 flex items-center gap-3 italic uppercase tracking-tight">
                <Calendar className="text-playful-pink" strokeWidth={3} /> Upcoming Fun
              </h2>
              <div className="playful-card overflow-hidden bg-white border-4 border-black shadow-solid">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-muted border-b-4 border-black font-black text-[10px] uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-5">Friend</th>
                        <th className="px-6 py-5">Service</th>
                        <th className="px-6 py-5">Arrival</th>
                        <th className="px-6 py-5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold text-sm">
                      {bookingsLoading ? (
                        <tr><td colSpan={4} className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-playful-pink h-8 w-8" strokeWidth={3} /></td></tr>
                      ) : bookings.length === 0 ? (
                        <tr><td colSpan={4} className="p-12 text-center text-muted-foreground italic font-bold">No adventures planned yet!</td></tr>
                      ) : (
                        bookings.map((booking) => (
                          <tr key={booking.id} className="border-b-2 border-black/5 last:border-0 hover:bg-muted/10 transition-colors">
                            <td className="px-6 py-5 font-black uppercase italic tracking-tighter text-lg">{dogs.find(d => d.id === booking.dogId)?.name || '...'}</td>
                            <td className="px-6 py-5 capitalize">{booking.serviceType}</td>
                            <td className="px-6 py-5">{new Date(booking.startDate).toLocaleDateString()}</td>
                            <td className="px-6 py-5">
                              <span className={cn(
                                "px-3 py-1 rounded-full border-2 border-black text-[10px] font-black uppercase",
                                booking.status === 'confirmed' ? 'bg-playful-green text-black' : 'bg-playful-yellow text-black'
                              )}>
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
          <aside className="space-y-6">
            <h2 className="text-3xl font-black flex items-center gap-3 italic uppercase tracking-tight">
              <CreditCard className="text-playful-green" strokeWidth={3} /> My Bills
            </h2>
            <div className="space-y-6">
              {invoicesLoading ? <Loader2 className="animate-spin text-playful-pink mx-auto" /> : invoices.length === 0 ? (
                <div className="playful-card p-10 text-center text-muted-foreground font-black italic bg-white border-dashed border-4 border-black">No bills found.</div>
              ) : invoices.map(invoice => (
                <motion.div key={invoice.id} whileHover={{ x: 4 }} className="playful-card p-8 bg-white space-y-6 border-4 border-black shadow-solid relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Invoice Date</p>
                      <p className="font-black text-lg">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black italic tracking-tighter">${invoice.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-4 border-t-2 border-black/5">
                    {invoice.status === 'paid' ? (
                      <div className="flex items-center gap-2 text-playful-green font-black text-xs uppercase tracking-widest border-2 border-black px-4 py-2 rounded-xl bg-playful-green/10 w-full justify-center">
                        <CheckCircle2 size={18} strokeWidth={3} /> PAID IN FULL
                      </div>
                    ) : (
                      <Button
                        onClick={() => handlePay(invoice.id)}
                        disabled={payMutation.isPending}
                        className="playful-btn w-full bg-playful-green text-black border-black h-12 text-sm font-black shadow-solid-sm"
                      >
                        {payMutation.isPending && payMutation.variables === invoice.id ? <Loader2 className="animate-spin mr-2 h-5 w-5" strokeWidth={3} /> : 'PAY NOW'}
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}