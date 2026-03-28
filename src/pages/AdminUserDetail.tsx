import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { User, Dog, Booking, Invoice } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mail, Dog as DogIcon, Calendar, CreditCard, PlusCircle, Loader2, Sparkles, Phone, MapPin, LifeBuoy } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
export function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const invoiceMutation = useMutation({
    mutationFn: (amount: number) => api('/api/invoices', {
      method: 'POST',
      body: JSON.stringify({ ownerId: id, amount })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-invoices'] });
      toast.success("Manual Invoice Created!", {
        description: "The client will see this on their dashboard.",
        icon: <Sparkles className="text-playful-yellow" />
      });
    },
    onError: (err) => toast.error("Failed to create invoice", { description: String(err) })
  });
  const handleManualInvoice = () => {
    const amountStr = prompt("Enter the amount for this manual invoice (e.g. 30.00):");
    const amount = parseFloat(amountStr || "");
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount", { description: "Please enter a positive numeric value." });
      return;
    }
    invoiceMutation.mutate(amount);
  };
  if (userLoading) return <AppLayout container><div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-playful-pink" /></div></AppLayout>;
  if (!user) return <AppLayout container><div className="text-center font-black p-20 text-2xl">Parent not found!</div></AppLayout>;
  return (
    <AppLayout container>
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <header className="flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="font-black hover:bg-playful-yellow/20 rounded-xl">
            <ChevronLeft className="mr-2" /> All Parents
          </Button>
          <Button
            onClick={handleManualInvoice}
            disabled={invoiceMutation.isPending}
            className="playful-btn bg-playful-pink text-white border-black"
          >
            {invoiceMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Manual Invoice
          </Button>
        </header>
        {/* Header Section */}
        <div className="playful-card p-10 bg-playful-yellow border-black text-black">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-3xl bg-white border-4 border-black shadow-solid flex items-center justify-center font-black text-4xl rotate-3">
              {user.name[0]}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-2">{user.name}</h1>
              <p className="text-xl font-bold flex items-center justify-center md:justify-start gap-2 opacity-80">
                <Mail size={20} strokeWidth={3} /> {user.email}
              </p>
            </div>
          </div>
        </div>
        {/* Contact & Emergency Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="playful-card p-8 bg-white border-4 border-black space-y-6">
            <h2 className="text-2xl font-black italic uppercase flex items-center gap-3 tracking-tight">
              <Phone className="text-playful-pink" strokeWidth={3} /> Contact Details
            </h2>
            <div className="space-y-4 font-bold text-lg">
              <div className="flex items-start gap-3">
                <Phone className="text-muted-foreground mt-1" size={18} />
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-widest leading-none mb-1">Mobile Number</p>
                  <p>{user.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-muted-foreground mt-1" size={18} />
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-widest leading-none mb-1">Full Address</p>
                  {user.address ? (
                    <p>
                      {user.address}<br />
                      {user.city}, {user.state} {user.zip}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">No address recorded</p>
                  )}
                </div>
              </div>
            </div>
          </section>
          <section className="playful-card p-8 bg-playful-blue/5 border-4 border-black space-y-6">
            <h2 className="text-2xl font-black italic uppercase flex items-center gap-3 tracking-tight">
              <LifeBuoy className="text-playful-blue" strokeWidth={3} /> Emergency Backup
            </h2>
            <div className="bg-white/50 border-2 border-black/5 p-6 rounded-2xl space-y-4">
              {user.emergencyName ? (
                <>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground font-black tracking-widest mb-1">Contact Name</p>
                    <p className="text-xl font-black italic">{user.emergencyName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground font-black tracking-widest mb-1">Contact Phone</p>
                    <p className="text-xl font-black">{user.emergencyPhone}</p>
                  </div>
                </>
              ) : (
                <p className="text-center font-bold text-muted-foreground italic py-4">No emergency contact recorded.</p>
              )}
            </div>
          </section>
        </div>
        {/* Pack Section */}
        <section>
          <h2 className="text-3xl font-black mb-6 flex items-center gap-3 italic uppercase tracking-tighter">
            <DogIcon className="text-playful-blue" strokeWidth={3} /> Registered Pack
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dogs.length === 0 ? (
              <div className="col-span-full p-12 playful-card bg-white border-4 border-dashed rounded-2xl text-center font-bold text-muted-foreground">No dogs registered yet.</div>
            ) : dogs.map(dog => (
              <motion.div key={dog.id} whileHover={{ y: -4 }} className="playful-card p-6 bg-white border-4 border-black">
                <div className="h-10 w-10 bg-playful-yellow rounded-xl border-2 border-black flex items-center justify-center mb-4 rotate-3">
                  <DogIcon size={20} />
                </div>
                <h4 className="font-black text-xl italic uppercase tracking-tight">{dog.name}</h4>
                <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">{dog.breed}</p>
                <Button asChild variant="outline" className="w-full border-2 border-black font-black h-10 hover:bg-playful-yellow/10">
                  <Link to={`/dogs/${dog.id}`}>Profile</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </section>
        {/* History & Billing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="playful-card p-8 bg-white border-4 border-black">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 italic uppercase">
              <Calendar className="text-playful-pink" strokeWidth={3} /> Adventure Log
            </h3>
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <p className="font-bold text-muted-foreground italic text-center py-6 border-2 border-dashed border-black/10 rounded-2xl">No bookings found.</p>
              ) : bookings.map(b => (
                <div key={b.id} className="p-4 border-2 border-black rounded-xl flex justify-between items-center font-bold shadow-solid-sm bg-white">
                  <div>
                    <p className="capitalize font-black text-lg italic tracking-tight">{b.serviceType}</p>
                    <p className="text-xs text-muted-foreground font-black uppercase">{new Date(b.startDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded border-2 border-black uppercase ${b.status === 'confirmed' ? 'bg-playful-green' : 'bg-playful-yellow'}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="playful-card p-8 bg-white border-4 border-black">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 italic uppercase">
              <CreditCard className="text-playful-green" strokeWidth={3} /> Fluffy Balance
            </h3>
            <div className="space-y-3">
              {invoices.length === 0 ? (
                <p className="font-bold text-muted-foreground italic text-center py-6 border-2 border-dashed border-black/10 rounded-2xl">No invoices found.</p>
              ) : invoices.map(inv => (
                <div key={inv.id} className="p-4 border-2 border-black rounded-xl flex justify-between items-center font-bold shadow-solid-sm bg-white">
                  <div>
                    <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">{new Date(inv.createdAt).toLocaleDateString()}</p>
                    <p className="text-2xl font-black italic tracking-tighter">${inv.amount}</p>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full border-2 border-black uppercase ${inv.status === 'paid' ? 'bg-playful-green text-black' : 'bg-playful-pink text-white'}`}>
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