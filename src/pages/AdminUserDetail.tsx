import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { User, Dog, Booking, Invoice } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mail, Dog as DogIcon, Calendar, CreditCard, PlusCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
export function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => api<User>(`/api/users/${id}`)
  });
  const { data: dogs = [] } = useQuery({
    queryKey: ['admin-user-dogs', id],
    queryFn: () => api<{ items: Dog[] }>('/api/dogs').then(res => res.items.filter(d => d.ownerId === id))
  });
  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-user-bookings', id],
    queryFn: () => api<{ items: Booking[] }>('/api/bookings').then(res => res.items.filter(b => b.ownerId === id))
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ['admin-user-invoices', id],
    queryFn: () => api<{ items: Invoice[] }>('/api/invoices').then(res => res.items.filter(i => i.ownerId === id))
  });
  const handleManualInvoice = () => toast.success("Mock: Manual invoice created for 30.00 fluffy points!");
  if (userLoading) return <AppLayout container><Loader2 className="animate-spin mx-auto mt-20" /></AppLayout>;
  if (!user) return <AppLayout container><div className="text-center font-black">Parent not found!</div></AppLayout>;
  return (
    <AppLayout container>
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <header className="flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="font-black hover:bg-playful-yellow/20">
            <ChevronLeft className="mr-2" /> All Parents
          </Button>
          <Button onClick={handleManualInvoice} className="playful-btn bg-playful-pink text-white border-black">
            <PlusCircle className="mr-2 h-4 w-4" /> Manual Invoice
          </Button>
        </header>
        <div className="playful-card p-10 bg-playful-yellow border-black text-black">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-3xl bg-white border-4 border-black shadow-solid flex items-center justify-center font-black text-4xl rotate-3">
              {user.name[0]}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter">{user.name}</h1>
              <p className="text-xl font-bold flex items-center justify-center md:justify-start gap-2 opacity-80">
                <Mail size={20} /> {user.email}
              </p>
            </div>
          </div>
        </div>
        <section>
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <DogIcon className="text-playful-blue" /> Registered Pack
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dogs.map(dog => (
              <motion.div key={dog.id} whileHover={{ y: -4 }} className="playful-card p-6 bg-white">
                <h4 className="font-black text-xl italic">{dog.name}</h4>
                <p className="text-xs font-bold text-muted-foreground mb-4">{dog.breed}</p>
                <Button asChild variant="outline" className="w-full border-2 border-black font-black h-10">
                  <Link to={`/dogs/${dog.id}`}>Profile</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="playful-card p-8 bg-white">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
              <Calendar className="text-playful-pink" /> Booking History
            </h3>
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="p-4 border-2 border-black/5 rounded-xl flex justify-between items-center font-bold">
                  <div>
                    <p className="capitalize">{b.serviceType}</p>
                    <p className="text-xs text-muted-foreground">{new Date(b.startDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded border-2 border-black uppercase ${b.status === 'confirmed' ? 'bg-playful-green' : 'bg-playful-yellow'}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="playful-card p-8 bg-white">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
              <CreditCard className="text-playful-green" /> Financial Summary
            </h3>
            <div className="space-y-3">
              {invoices.map(inv => (
                <div key={inv.id} className="p-4 border-2 border-black/5 rounded-xl flex justify-between items-center font-bold">
                  <div>
                    <p className="text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</p>
                    <p className="text-lg font-black">${inv.amount}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded border-2 border-black uppercase ${inv.status === 'paid' ? 'bg-playful-green text-black' : 'bg-playful-pink text-white'}`}>
                    {inv.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}