import React from 'react';
import { Download, Search, CheckCircle2, XCircle, PiggyBank, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Invoice, User } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
export function AdminBilling() {
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api<{ items: Invoice[] }>('/api/invoices').then(res => res.items)
  });
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => api<{ items: User[] }>('/api/users').then(res => res.items)
  });
  const totalCollected = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingDues = invoices
    .filter(inv => inv.status === 'unpaid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3">
              Fluffy Billing <PiggyBank className="text-playful-green" />
            </h1>
            <p className="font-bold text-muted-foreground">Financial Transparency & Revenue</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="playful-input pl-10 h-12" placeholder="Search fluffy parents..." />
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="playful-card p-6 bg-playful-green text-black">
            <p className="font-bold uppercase text-xs tracking-wider">Total Collected</p>
            <p className="text-4xl font-black">${totalCollected.toFixed(2)}</p>
          </div>
          <div className="playful-card p-6 bg-playful-pink text-white">
            <p className="font-bold uppercase text-xs tracking-wider">Pending Dues</p>
            <p className="text-4xl font-black">${pendingDues.toFixed(2)}</p>
          </div>
          <div className="playful-card p-6 bg-playful-blue text-white">
            <p className="font-bold uppercase text-xs tracking-wider">Total Invoiced</p>
            <p className="text-4xl font-black">${(totalCollected + pendingDues).toFixed(2)}</p>
          </div>
        </div>
        <div className="playful-card overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted border-b-4 border-black font-black text-sm uppercase">
                <tr>
                  <th className="px-6 py-5 tracking-tight">Parent</th>
                  <th className="px-6 py-5 tracking-tight">Invoice Date</th>
                  <th className="px-6 py-5 tracking-tight">Amount</th>
                  <th className="px-6 py-5 tracking-tight">Status</th>
                  <th className="px-6 py-5 text-right tracking-tight">Actions</th>
                </tr>
              </thead>
              <tbody className="font-bold">
                {loadingInvoices || loadingUsers ? (
                  <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                ) : invoices.map((invoice) => {
                  const user = users.find(u => u.id === invoice.ownerId);
                  return (
                    <tr key={invoice.id} className="border-b-2 border-black/5 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-playful-yellow border-4 border-black flex items-center justify-center font-black">
                            {user?.name?.[0] || '?'}
                          </div>
                          <span className="text-lg">{user?.name || 'Unknown Client'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-black text-xl">${invoice.amount}</td>
                      <td className="px-6 py-4">
                        {invoice.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1.5 text-playful-green bg-playful-green/10 px-3 py-1 rounded-full border-2 border-playful-green/30">
                            <CheckCircle2 className="w-4 h-4" /> PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-playful-pink bg-playful-pink/10 px-3 py-1 rounded-full border-2 border-playful-pink/30">
                            <XCircle className="w-4 h-4" /> UNPAID
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-3 hover:bg-playful-blue/10 rounded-2xl transition-all active:scale-95 border-2 border-transparent hover:border-black/5">
                          <Download className="w-5 h-5" />
                        </button>
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