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
      .filter(u => u.name.toLowerCase().includes(searchLower) || u.email.toLowerCase().includes(searchLower))
      .map(client => {
        const clientDogs = dogs.filter(d => d.ownerId === client.id);
        const unpaidBalance = invoices
          .filter(i => i.ownerId === client.id && i.status === 'unpaid')
          .reduce((sum, i) => sum + i.amount, 0);
        return {
          ...client,
          dogCount: clientDogs.length,
          unpaidBalance
        };
      });
  }, [usersPage, dogs, invoices, searchTerm]);
  return (
    <AppLayout container>
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter flex items-center gap-3 uppercase">
              CLIENT ROSTER <Users className="text-playful-blue" strokeWidth={3} />
            </h1>
            <p className="font-bold text-muted-foreground text-xl">Manage pet parents and their buddies</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={3} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="playful-input pl-11 h-14 border-4 border-black"
              placeholder="Find a fluffy parent..."
            />
          </div>
        </header>
        <div className="grid grid-cols-1 gap-6">
          {(loadingUsers || loadingDogs || loadingInvoices) ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="animate-spin h-12 w-12 text-playful-pink" strokeWidth={3} />
              <p className="font-black text-2xl italic">Gathering the pack...</p>
            </div>
          ) : clientStats.length === 0 ? (
            <div className="playful-card p-12 text-center font-bold text-muted-foreground border-dashed border-4 border-black">
              No parents found matching that name!
            </div>
          ) : clientStats.map((client) => (
            <motion.div
              key={client.id}
              whileHover={{ x: 6 }}
              className="playful-card p-6 bg-white border-4 border-black shadow-solid flex flex-col md:flex-row items-center gap-6 justify-between group"
            >
              <div className="flex items-center gap-5 flex-1 w-full md:w-auto">
                <div className="w-16 h-16 rounded-3xl bg-playful-yellow border-4 border-black flex items-center justify-center font-black text-2xl shadow-solid-sm rotate-3 group-hover:rotate-6 transition-transform">
                  {client.name[0]}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-1">{client.name}</h3>
                  <p className="font-bold text-muted-foreground text-sm uppercase tracking-widest truncate">{client.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-10 items-center justify-center md:justify-end w-full md:w-auto">
                <div className="text-center md:text-right">
                  <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1 justify-center md:justify-end mb-1">
                    <DogIcon size={14} strokeWidth={3} /> Registered Dogs
                  </p>
                  <p className="text-3xl font-black italic tracking-tighter">{client.dogCount}</p>
                </div>
                <div className="text-center md:text-right min-w-[100px]">
                  <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1 justify-center md:justify-end mb-1">
                    <CreditCard size={14} strokeWidth={3} /> Balance
                  </p>
                  <p className={`text-3xl font-black italic tracking-tighter ${client.unpaidBalance > 0 ? 'text-playful-pink' : 'text-playful-green'}`}>
                    ${client.unpaidBalance.toFixed(2)}
                  </p>
                </div>
                <Button asChild className="playful-btn bg-playful-blue text-white border-black h-14 px-8 text-lg hover:bg-playful-blue/90 shadow-solid transition-all hover:scale-105 active:scale-95">
                  <Link to={`/admin/clients/${client.id}`} className="flex items-center">
                    Manage Parent <ArrowRight className="ml-2 h-5 w-5" strokeWidth={3} />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}