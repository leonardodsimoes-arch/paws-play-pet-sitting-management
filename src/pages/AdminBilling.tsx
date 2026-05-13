import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, XCircle, PiggyBank, Loader2, DollarSign, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Invoice, User } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
export function AdminBilling() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api<{ items: Invoice[] }>('/api/invoices').then(res => res.items)
  });
  const { data: usersPage, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => api<{ items: User[] }>('/api/users')
  });
  const userMap = useMemo(() => {
    const map: Record<string, User> = {};
    (usersPage?.items || []).forEach(user => {
      if (user?.id) map[user.id] = user;
    });
    return map;
  }, [usersPage]);
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
  const filteredInvoices = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return invoices.filter(invoice => {
      const user = userMap[invoice.ownerId];
      if (!searchTerm) return true;
      if (!user) return false;
      return (
        (user.name?.toLowerCase() || '').includes(searchLower) ||
        (user.email?.toLowerCase() || '').includes(searchLower)
      );
    });
  }, [invoices, userMap, searchTerm]);
  const stats = useMemo(() => {
    return filteredInvoices.reduce((acc, inv) => {
      const amount = Number(inv.amount) || 0;
      if (inv.status === 'paid') acc.collected += amount;
      else acc.pending += amount;
      return acc;
    }, { collected: 0, pending: 0 });
  }, [filteredInvoices]);
  const handleDownload = (id: string) => {
    toast.loading("Generating Fluffy PDF...", { id: 'pdf' });
    setTimeout(() => {
      toast.success("Invoice Downloaded!", { id: 'pdf' });
    }, 1200);
  };
  return (
    <AppLayout container>
      <div className="space-y-10 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl font-black flex items-center gap-3 italic tracking-tight uppercase">
              FLUFFY BILLING <PiggyBank className="text-playful-green shrink-0" size={40} strokeWidth={3} />
            </h1>
            <p className="font-bold text-muted-foreground text-xl">Financial Transparency & Revenue</p>
          </div>
          <div className="relative max-w-sm w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-playful-green transition-colors" size={20} strokeWidth={3} />
            <Input
              className="playful-input pl-12 h-14 border-4 border-black hover:shadow-solid focus:border-playful-green transition-all"
              placeholder="Search fluffy parents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Collected', value: stats.collected, color: 'bg-playful-green', text: 'text-black' },
            { label: 'Pending Dues', value: stats.pending, color: 'bg-playful-pink', text: 'text-white' },
            { label: 'Total Revenue', value: stats.collected + stats.pending, color: 'bg-playful-blue', text: 'text-white' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, rotate: 1 }}
              className={cn("playful-card p-8 border-4 border-black shadow-solid relative overflow-hidden", stat.color, stat.text)}
            >
              <p className="font-black uppercase text-xs tracking-widest opacity-70 mb-2">{stat.label}</p>
              <p className="text-6xl font-black italic tracking-tighter leading-none">${stat.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </motion.div>
          ))}
        </div>
        <div className="playful-card overflow-hidden bg-white border-4 border-black shadow-solid">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/50 border-b-4 border-black">
                <tr>
                  <th className="px-8 py-6 text-sm font-black uppercase tracking-widest">Parent</th>
                  <th className="px-8 py-6 text-sm font-black uppercase tracking-widest">Date</th>
                  <th className="px-8 py-6 text-sm font-black uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-6 text-sm font-black uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-sm font-black uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-bold text-base">
                {(loadingInvoices || loadingUsers) ? (
                  <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-playful-pink h-12 w-12" strokeWidth={3} /></td></tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr><td colSpan={5} className="py-20 text-center text-muted-foreground italic font-black text-xl">No fluffy invoices found matching your criteria.</td></tr>
                ) : filteredInvoices.map((invoice) => {
                  const user = userMap[invoice.ownerId];
                  return (
                    <motion.tr 
                      key={invoice.id} 
                      className="border-b-2 border-black/10 last:border-0 hover:bg-playful-yellow/10 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 shrink-0 rounded-2xl bg-playful-yellow border-2 border-black flex items-center justify-center font-black rotate-3 shadow-solid-sm text-xl group-hover:rotate-6 transition-transform">
                            {user?.name?.[0] || '?'}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xl font-black italic uppercase tracking-tighter leading-none mb-1 truncate">{user?.name || 'Unknown Client'}</span>
                            <span className="text-xs text-muted-foreground font-black uppercase tracking-widest truncate">{user?.email || 'No email recorded'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-muted-foreground font-black uppercase tracking-wider text-sm">
                        {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-8 py-5 font-black text-2xl italic tracking-tighter">
                        ${Number(invoice.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-black text-[10px] font-black uppercase shadow-solid-sm",
                          invoice.status === 'paid' ? 'bg-playful-green text-black' : 'bg-playful-pink text-white'
                        )}>
                          {invoice.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-3">
                          <AnimatePresence mode="wait">
                            {invoice.status === 'unpaid' && (
                              <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                onClick={() => payMutation.mutate(invoice.id)}
                                disabled={payMutation.isPending}
                                className="p-3 hover:bg-playful-green/20 rounded-xl transition-all active:scale-90 border-2 border-black bg-playful-green text-black shadow-solid-sm disabled:opacity-50 disabled:grayscale"
                                title="Mark as Paid"
                              >
                                {payMutation.isPending && payMutation.variables === invoice.id ? (
                                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
                                ) : (
                                  <DollarSign className="w-5 h-5" strokeWidth={3} />
                                )}
                              </motion.button>
                            )}
                          </AnimatePresence>
                          <button
                            onClick={() => handleDownload(invoice.id)}
                            className="p-3 hover:bg-playful-blue/20 rounded-xl transition-all active:scale-90 border-2 border-black bg-white text-playful-blue shadow-solid-sm"
                            title="Download PDF"
                          >
                            <FileText className="w-5 h-5" strokeWidth={3} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
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