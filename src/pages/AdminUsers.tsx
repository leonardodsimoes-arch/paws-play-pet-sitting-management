import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { User, Dog, Invoice } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Search, Users, ArrowRight, Dog as DogIcon, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
export function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: usersPage, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: () => api<{ items: User[] }>('/api/users')
  });
  const { data: dogs = [], isLoading: loadingDogs } = useQuery({
    queryKey: ['admin-all-dogs'],
    queryFn: () => api<{ items: Dog[] }>('/api/dogs').then(res => res.items)
  });
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['admin-all-invoices'],
    queryFn: () => api<{ items: Invoice[] }>('/api/invoices').then(res => res.items)
  });
  const clientStats = useMemo(() => {
    const clients = (usersPage?.items || []).filter(u => u.role === 'client');
    const searchLower = searchTerm.toLowerCase();
    return clients
      .filter(u => (u.name?.toLowerCase() || '').includes(searchLower) || (u.email?.toLowerCase() || '').includes(searchLower))
      .map(client => {
        const clientDogs = dogs.filter(d => d.ownerId === client.id);
        const unpaidBalance = invoices
          .filter(i => i.ownerId === client.id && i.status === 'unpaid')
          .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
        return {
          ...client,
          dogCount: clientDogs.length,
          unpaidBalance
        };
      });
  }, [usersPage, dogs, invoices, searchTerm]);
  return (
    <AppLayout container>
      <div className="space-y-8 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl font-black italic tracking-tighter flex items-center gap-3 uppercase">
              CLIENT ROSTER <Users className="text-playful-blue shrink-0" size={40} strokeWidth={3} />
            </h1>
            <p className="font-bold text-muted-foreground text-xl">Manage pet parents and their buddies</p>
          </div>
          <div className="relative max-w-sm w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-playful-blue transition-colors" size={20} strokeWidth={3} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="playful-input pl-12 h-14 border-4 border-black focus:ring-0 focus:border-playful-blue transition-all"
              placeholder="Find a fluffy parent..."
            />
          </div>
        </header>
        <div className="grid grid-cols-1 gap-6">
          {(loadingUsers || loadingDogs || loadingInvoices) ? (
            <div className="flex flex-col items-center justify-center p-24 gap-6">
              <Loader2 className="animate-spin h-14 w-14 text-playful-pink" strokeWidth={3} />
              <p className="font-black text-2xl italic animate-pulse">Gathering the pack...</p>
            </div>
          ) : clientStats.length === 0 ? (
            <div className="playful-card p-16 text-center font-bold text-muted-foreground border-dashed border-4 border-black bg-white/50">
              <Users className="mx-auto mb-4 opacity-20" size={64} strokeWidth={2} />
              <p className="text-2xl italic font-black uppercase tracking-tight">No parents found matching that name!</p>
            </div>
          ) : (
            clientStats.map((client) => (
              <motion.div
                key={client.id}
                whileHover={{ x: 8, scale: 1.005 }}
                className="playful-card p-6 bg-white border-4 border-black shadow-solid flex flex-col md:flex-row items-center gap-6 justify-between group overflow-hidden"
              >
                <div className="flex items-center gap-5 flex-1 w-full md:w-auto">
                  <div className="w-20 h-20 shrink-0 rounded-3xl bg-playful-yellow border-4 border-black flex items-center justify-center font-black text-3xl shadow-solid-sm rotate-3 group-hover:rotate-6 transition-transform">
                    {client.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2 truncate">{client.name || 'Anonymous Parent'}</h3>
                    <p className="font-bold text-muted-foreground text-sm uppercase tracking-widest truncate">{client.email || 'No email registered'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-10 items-center justify-center md:justify-end w-full md:w-auto">
                  <div className="text-center md:text-right">
                    <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1 justify-center md:justify-end mb-1">
                      <DogIcon size={14} strokeWidth={3} /> Registered Dogs
                    </p>
                    <p className="text-3xl font-black italic tracking-tighter">{client.dogCount}</p>
                  </div>
                  <div className="text-center md:text-right min-w-[120px]">
                    <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1 justify-center md:justify-end mb-1">
                      <CreditCard size={14} strokeWidth={3} /> Balance
                    </p>
                    <p className={cn(
                      "text-3xl font-black italic tracking-tighter",
                      client.unpaidBalance > 0 ? 'text-playful-pink' : 'text-playful-green'
                    )}>
                      ${client.unpaidBalance.toFixed(2)}
                    </p>
                  </div>
                  <Button asChild disabled={!client.id} className="playful-btn bg-playful-blue text-white border-black h-16 px-10 text-xl hover:bg-playful-blue/90 shadow-solid transition-all active:scale-95 active:shadow-solid-sm">
                    <Link to={client.id ? `/admin/clients/${client.id}` : '#'}>
                      Manage Parent <ArrowRight className="ml-2 h-6 w-6" strokeWidth={3} />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}