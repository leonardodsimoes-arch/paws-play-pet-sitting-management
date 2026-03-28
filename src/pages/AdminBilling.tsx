import React from 'react';
import { CreditCard, Download, Search, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MOCK_INVOICES, MOCK_USERS } from '@shared/mock-data';
export function AdminBilling() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black">Billing & Invoices</h1>
            <p className="font-bold text-muted-foreground">Track payments and revenue</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="playful-input pl-10" placeholder="Search client name..." />
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="playful-card p-6 bg-playful-green text-black">
            <p className="font-bold">Total Collected</p>
            <p className="text-4xl font-black">$2,450.00</p>
          </div>
          <div className="playful-card p-6 bg-playful-pink text-white">
            <p className="font-bold">Pending Invoices</p>
            <p className="text-4xl font-black">$320.00</p>
          </div>
          <div className="playful-card p-6 bg-playful-blue text-white">
            <p className="font-bold">Next Payout</p>
            <p className="text-4xl font-black">$1,100.00</p>
          </div>
        </div>
        <div className="playful-card overflow-hidden bg-white">
          <table className="w-full text-left">
            <thead className="bg-muted border-b-4 border-black font-black">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-bold">
              {MOCK_INVOICES.map((invoice) => {
                const user = MOCK_USERS.find(u => u.id === invoice.ownerId);
                return (
                  <tr key={invoice.id} className="border-b-2 border-black/5 last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-playful-yellow border-2 border-black" />
                        <span>{user?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-black">${invoice.amount}</td>
                    <td className="px-6 py-4">
                      {invoice.status === 'paid' ? (
                        <span className="flex items-center gap-1 text-playful-green">
                          <CheckCircle2 className="w-4 h-4" /> PAID
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-playful-pink">
                          <XCircle className="w-4 h-4" /> UNPAID
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-playful-blue/10 rounded-lg transition-colors">
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
  );
}