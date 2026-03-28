import React, { useState } from 'react';
import { Search, CheckCircle2, XCircle, PiggyBank, Loader2, DollarSign, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Invoice, User } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
export function AdminBilling() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api<{ items: Invoice[] }>('/api/invoices').then(res => res.items)
  });
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => api<{ items: User[] }>('/api/users').then(res => res.items)
  });
  const payMutation = useMutation({
    mutationFn: (id: string) => api(`/api/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'paid' })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success("Payment Recorded!", { description: "Invoice status updated to PAID." });
    },
    onError: (err) => toast.error("Update failed", { description: String(err) })
  });
  const handleDownload = (id: string) => {
    toast.loading("Generating Fluffy PDF...", { id: 'pdf' });
    setTimeout(() => {
      toast.success("Invoice Downloaded!", { id: 'pdf' });
    }, 1500);
  };
  const filteredInvoices = invoices.filter(invoice => {
    if (!searchTerm) return true;
    const user = users.find(u => u.id === invoice.ownerId);
    if (!user) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });
  const totalCollected = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingDues = filteredInvoices
    .filter(inv => inv.status === 'unpaid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  return (
    <AppLayout container>
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3 italic tracking-tight uppercase">
              FLUFFY BILLING <PiggyBank className="text-playful-green" strokeWidth={3} />
            </h1>
            <p className="font-bold text-muted-foreground text-lg">Financial Transparency & Revenue</p>
          </div>
          <div className="relative max-w-sm w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" strokeWidth={3} />
            <motion.div whileFocus={{ scale: 1.02 }} className="relative">
              <Input
                className="playful-input pl-11 h-14 hover:shadow-solid transition-shadow border-4 border-black"
                placeholder="Search fluffy parents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </motion.div>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -4 }} className="playful-card p-8 bg-playful-green text-black border-4 border-black shadow-solid">
            <p className="font-black uppercase text-xs tracking-widest opacity-70">Filtered Collected</p>
            <p className="text-5xl font-black italic tracking-tighter">${totalCollected.toFixed(2)}</p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="playful-card p-8 bg-playful-pink text-white border-4 border-black shadow-solid">
            <p className="font-black uppercase text-xs tracking-widest opacity-70">Filtered Dues</p>
            <p className="text-5xl font-black italic tracking-tighter">${pendingDues.toFixed(2)}</p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="playful-card p-8 bg-playful-blue text-white border-4 border-black shadow-solid">
            <p className="font-black uppercase text-xs tracking-widest opacity-70">Filtered Total</p>
            <p className="text-5xl font-black italic tracking-tighter">${(totalCollected + pendingDues).toFixed(2)}</p>
          </motion.div>
        </div>
        <div className="playful-card overflow-hidden bg-white border-4 border-black shadow-solid">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted border-b-4 border-black">
                <tr>
                  <th className="px-6 py-5 text-sm font-black uppercase tracking-widest">Parent</th>
                  <th className="px-6 py-5 text-sm font-black uppercase tracking-widest">Date</th>
                  <th className="px-6 py-5 text-sm font-black uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-5 text-sm font-black uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-sm font-black uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-bold text-sm">
                {loadingInvoices || loadingUsers ? (
                  <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-playful-pink h-8 w-8" strokeWidth={3} /></td></tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-muted-foreground italic">No fluffy invoices found.</td></tr>
                ) : filteredInvoices.map((invoice) => {
                  const user = users.find(u => u.id === invoice.ownerId);
                  return (
                    <tr key={invoice.id} className="border-b-2 border-black/10 last:border-0 hover:bg-playful-yellow/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-playful-yellow border-2 border-black flex items-center justify-center font-black rotate-3 shadow-solid-sm text-lg">
                            {user?.name?.[0] || '?'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-lg font-black italic uppercase tracking-tighter leading-none mb-1">{user?.name || 'Unknown Client'}</span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{user?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-black uppercase tracking-wider">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-black text-xl italic tracking-tighter">${invoice.amount}</td>
                      <td className="px-6 py-4">
                        {invoice.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1.5 text-playful-green bg-playful-green/10 px-4 py-1 rounded-full border-2 border-black text-[10px] font-black uppercase">
                            <CheckCircle2 className="w-3 h-3" strokeWidth={3} /> PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-playful-pink bg-playful-pink/10 px-4 py-1 rounded-full border-2 border-black text-[10px] font-black uppercase">
                            <XCircle className="w-3 h-3" strokeWidth={3} /> UNPAID
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          {invoice.status === 'unpaid' && (
                            <button
                              onClick={() => payMutation.mutate(invoice.id)}
                              disabled={payMutation.isPending}
                              className="p-3 hover:bg-playful-green/20 rounded-xl transition-all active:scale-90 border-2 border-black bg-playful-green text-black shadow-solid-sm"
                              title="Mark as Paid"
                            >
                              <DollarSign className="w-5 h-5" strokeWidth={3} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(invoice.id)}
                            className="p-3 hover:bg-playful-blue/20 rounded-xl transition-all active:scale-90 border-2 border-black bg-white text-playful-blue shadow-solid-sm"
                          >
                            <FileText className="w-5 h-5" strokeWidth={3} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}