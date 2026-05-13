import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { User, Dog, Booking, Invoice } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mail, Dog as DogIcon, Calendar, CreditCard, PlusCircle, Loader2, Sparkles, Phone, MapPin, LifeBuoy, ArrowRight, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { parseLocalISO, cn } from '@/lib/utils';
import { format } from 'date-fns';
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
    const amountStr = window.prompt("Enter the amount for this manual invoice (e.g. 30.00):");
    if (amountStr === null) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount", { description: "Please enter a positive numeric value." });
      return;
    }
    invoiceMutation.mutate(amount);
  };
  if (userLoading) return <AppLayout container><div className="flex flex-col items-center justify-center p-24 gap-4"><Loader2 className="animate-spin h-14 w-14 text-playful-pink" strokeWidth={3} /><p className="font-black text-xl italic animate-pulse">Finding the parent...</p></div></AppLayout>;
  if (!user) return <AppLayout container><div className="text-center font-black p-24 text-3xl italic uppercase tracking-tighter">Parent not found!</div></AppLayout>;
  return (
    <AppLayout container>
      <div className="space-y-10 max-w-7xl mx-auto px-4">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="font-black hover:bg-playful-yellow/20 rounded-xl px-6 h-12 text-lg border-2 border-transparent hover:border-black transition-all">
            <ChevronLeft className="mr-2" strokeWidth={3} /> All Parents
          </Button>
          <Button
            onClick={handleManualInvoice}
            disabled={invoiceMutation.isPending}
            className="playful-btn bg-playful-pink text-white border-black h-14 px-8 text-lg hover:shadow-solid-lg active:scale-95"
          >
            {invoiceMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" strokeWidth={3} /> : <PlusCircle className="mr-2 h-5 w-5" strokeWidth={3} />}
            Manual Invoice
          </Button>
        </header>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="playful-card p-10 bg-playful-yellow border-4 border-black text-black shadow-solid relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-28 h-28 rounded-3xl bg-white border-4 border-black shadow-solid flex items-center justify-center font-black text-5xl rotate-3 shrink-0">
              {user.name[0]}
            </div>
            <div className="text-center md:text-left space-y-2 min-w-0">
              <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none truncate">{user.name}</h1>
              <p className="text-2xl font-bold flex items-center justify-center md:justify-start gap-3 opacity-80 italic">
                <Mail size={24} strokeWidth={3} className="shrink-0" /> <span className="truncate">{user.email}</span>
              </p>
            </div>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="playful-card p-8 bg-white border-4 border-black space-y-6 shadow-solid">
            <h2 className="text-3xl font-black italic uppercase flex items-center gap-3 tracking-tight">
              <Phone className="text-playful-pink shrink-0" size={32} strokeWidth={3} /> Contact Details
            </h2>
            <div className="space-y-6 font-bold text-xl">
              <div className="flex items-start gap-4">
                <div className="bg-playful-pink/10 p-3 rounded-2xl border-2 border-black shrink-0"><Phone size={24} strokeWidth={3} className="text-playful-pink" /></div>
                <div>
                  <p className="text-[11px] uppercase text-muted-foreground tracking-widest leading-none mb-2 font-black">Mobile Number</p>
                  <p className="italic">{user.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-playful-blue/10 p-3 rounded-2xl border-2 border-black shrink-0"><MapPin size={24} strokeWidth={3} className="text-playful-blue" /></div>
                <div>
                  <p className="text-[11px] uppercase text-muted-foreground tracking-widest leading-none mb-2 font-black">Home Address</p>
                  {user.address ? (
                    <p className="italic leading-relaxed">
                      {user.address}<br />
                      {user.city}, {user.state} {user.zip}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">No address recorded</p>
                  )}
                </div>
              </div>
            </div>
          </section>
          <section className="playful-card p-8 bg-playful-blue/5 border-4 border-black space-y-6 shadow-solid">
            <h2 className="text-3xl font-black italic uppercase flex items-center gap-3 tracking-tight">
              <LifeBuoy className="text-playful-blue shrink-0" size={32} strokeWidth={3} /> Emergency Backup
            </h2>
            <div className="bg-white border-4 border-black p-8 rounded-3xl space-y-6 shadow-solid-sm relative overflow-hidden min-h-[180px] flex flex-col justify-center">
              {user.emergencyName ? (
                <>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase text-muted-foreground font-black tracking-widest mb-2 leading-none">Contact Name</p>
                    <p className="text-3xl font-black italic uppercase tracking-tighter truncate leading-tight">{user.emergencyName}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase text-muted-foreground font-black tracking-widest mb-2 leading-none">Contact Phone</p>
                    <p className="text-3xl font-black italic tracking-tighter leading-tight">{user.emergencyPhone}</p>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                   <AlertTriangle className="mx-auto text-muted-foreground" size={40} />
                   <p className="font-bold text-muted-foreground italic text-xl">No emergency contact recorded.</p>
                </div>
              )}
            </div>
          </section>
        </div>
        <section className="space-y-8">
          <h2 className="text-4xl font-black flex items-center gap-3 italic uppercase tracking-tighter">
            <DogIcon className="text-playful-blue shrink-0" size={36} strokeWidth={3} /> Registered Pack
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {dogs.length === 0 ? (
              <div className="col-span-full p-16 playful-card bg-white border-4 border-dashed rounded-3xl text-center font-bold text-muted-foreground text-2xl italic">No dogs registered yet.</div>
            ) : dogs.map(dog => (
              <motion.div
                key={dog.id}
                whileHover={{ y: -6, scale: 1.02 }}
                className="playful-card p-8 bg-white border-4 border-black group shadow-solid"
              >
                <div className="h-14 w-14 bg-playful-yellow rounded-2xl border-4 border-black flex items-center justify-center mb-6 rotate-3 shadow-solid-sm group-hover:rotate-6 transition-transform shrink-0">
                  <DogIcon size={28} strokeWidth={3} />
                </div>
                <h4 className="font-black text-3xl italic uppercase tracking-tighter leading-none mb-1 truncate">{dog.name}</h4>
                <p className="text-[11px] font-black text-muted-foreground mb-6 uppercase tracking-widest truncate">{dog.breed}</p>
                <Button asChild className="w-full playful-btn bg-playful-blue text-white border-black h-12 text-base font-black shadow-solid-sm active:translate-y-0.5">
                  <Link to={`/dogs/${dog.id}`} className="flex items-center justify-center gap-2">View Profile <ArrowRight size={16} /></Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="playful-card p-8 bg-white border-4 border-black shadow-solid">
            <h3 className="text-3xl font-black mb-8 flex items-center gap-4 italic uppercase">
              <Calendar className="text-playful-pink shrink-0" size={32} strokeWidth={3} /> Adventure Log
            </h3>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="py-16 text-center border-4 border-dashed border-black/10 rounded-[2.5rem] bg-muted/20">
                  <p className="font-black text-xl text-muted-foreground italic">No bookings found yet!</p>
                </div>
              ) : bookings.sort((a,b) => parseLocalISO(b.startDate).getTime() - parseLocalISO(a.startDate).getTime()).map(b => {
                const startDate = parseLocalISO(b.startDate);
                return (
                  <div key={b.id} className="p-5 border-4 border-black rounded-2xl flex justify-between items-center font-bold shadow-solid-sm bg-white hover:bg-playful-pink/5 transition-colors group">
                    <div>
                      <p className="capitalize font-black text-2xl italic tracking-tighter leading-tight group-hover:text-playful-pink transition-colors">{b.serviceType}</p>
                      <p className="text-xs text-muted-foreground font-black uppercase tracking-wider">{format(startDate, 'MMMM do, yyyy')}</p>
                    </div>
                    <span className={cn(
                      "text-[10px] font-black px-3 py-1 rounded-full border-2 border-black uppercase shadow-solid-sm",
                      b.status === 'confirmed' ? 'bg-playful-green' : 'bg-playful-yellow'
                    )}>
                      {b.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="playful-card p-8 bg-white border-4 border-black shadow-solid">
            <h3 className="text-3xl font-black mb-8 flex items-center gap-4 italic uppercase">
              <CreditCard className="text-playful-green shrink-0" size={32} strokeWidth={3} /> Fluffy Balance
            </h3>
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <div className="py-16 text-center border-4 border-dashed border-black/10 rounded-[2.5rem] bg-muted/20">
                   <p className="font-black text-xl text-muted-foreground italic">No invoices issued yet.</p>
                </div>
              ) : invoices.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(inv => (
                <div key={inv.id} className="p-5 border-4 border-black rounded-2xl flex justify-between items-center font-bold shadow-solid-sm bg-white hover:bg-playful-green/5 transition-colors group">
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1">{format(new Date(inv.createdAt), 'MMM d, yyyy')}</p>
                    <p className="text-3xl font-black italic tracking-tighter leading-tight">${Number(inv.amount).toFixed(2)}</p>
                  </div>
                  <span className={cn(
                    "text-[10px] font-black px-4 py-1.5 rounded-full border-2 border-black uppercase shadow-solid-sm whitespace-nowrap",
                    inv.status === 'paid' ? 'bg-playful-green text-black' : 'bg-playful-pink text-white'
                  )}>
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