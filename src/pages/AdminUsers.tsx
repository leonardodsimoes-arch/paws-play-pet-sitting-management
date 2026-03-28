import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { User, Dog, Invoice } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Search, Users, ArrowRight, Dog as DogIcon, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
export function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: usersPage, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: () => api<{ items: User[] }>('/api/users')
  });
  const { data: dogs = [] } = useQuery({
    queryKey: ['admin-all-dogs'],
    queryFn: () => api<{ items: Dog[] }>('/api/dogs').then(res => res.items)
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ['admin-all-invoices'],
    queryFn: () => api<{ items: Invoice[] }>('/api/invoices').then(res => res.items)
  });
  const clients = (usersPage?.items || []).filter(u => u.role === 'client' && 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  return (
    <AppLayout container>
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter flex items-center gap-3">
              CLIENT ROSTER <Users className="text-playful-blue" />
            </h1>
            <p className="font-bold text-muted-foreground text-xl">Manage pet parents and their buddies</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="playful-input pl-10 h-12" 
              placeholder="Find a fluffy parent..." 
            />
          </div>
        </header>
        <div className="grid grid-cols-1 gap-6">
          {loadingUsers ? (
            <div className="p-12 text-center font-black">Scanning the park...</div>
          ) : clients.length === 0 ? (
            <div className="playful-card p-12 text-center font-bold text-muted-foreground border-dashed">No parents found matching that name!</div>
          ) : clients.map((client) => {
            const clientDogs = dogs.filter(d => d.ownerId === client.id);
            const clientUnpaid = invoices.filter(i => i.ownerId === client.id && i.status === 'unpaid').reduce((sum, i) => sum + i.amount, 0);
            return (
              <motion.div 
                key={client.id}
                whileHover={{ x: 4 }}
                className="playful-card p-6 bg-white flex flex-col md:flex-row items-center gap-6 justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 rounded-3xl bg-playful-yellow border-4 border-black flex items-center justify-center font-black text-2xl shadow-solid-sm">
                    {client.name[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">{client.name}</h3>
                    <p className="font-bold text-muted-foreground text-sm">{client.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-8 items-center justify-center md:justify-end">
                  <div className="text-center md:text-right">
                    <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                      <DogIcon size={12} /> Registered Dogs
                    </p>
                    <p className="text-xl font-black">{clientDogs.length}</p>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                      <CreditCard size={12} /> Balance
                    </p>
                    <p className={`text-xl font-black ${clientUnpaid > 0 ? 'text-playful-pink' : 'text-playful-green'}`}>
                      ${clientUnpaid.toFixed(2)}
                    </p>
                  </div>
                  <Button asChild className="playful-btn bg-playful-blue text-white border-black h-12 px-6">
                    <Link to={`/admin/clients/${client.id}`}>Manage Parent <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}