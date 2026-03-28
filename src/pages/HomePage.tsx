import React from 'react';
import { Link } from 'react-router-dom';
import { Dog, ShieldCheck, CalendarCheck, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-12 md:py-20 flex flex-col items-center text-center space-y-12">
        <div className="relative">
          <div className="w-24 h-24 bg-playful-yellow border-4 border-black rounded-2xl shadow-solid flex items-center justify-center -rotate-6">
            <Dog className="w-12 h-12" strokeWidth={3} />
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-playful-pink border-4 border-black rounded-full shadow-solid flex items-center justify-center rotate-12">
            <span className="font-black text-white">HI!</span>
          </div>
        </div>
        <div className="space-y-6 max-w-2xl">
          <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight">
            PAWS <span className="text-playful-pink">&</span> PLAY
          </h1>
          <p className="text-xl md:text-2xl font-bold text-muted-foreground leading-snug">
            A happy home away from home for your best friends. Boarding, Daycare, and Walking with love!
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
          <Button asChild className="playful-btn bg-playful-yellow hover:bg-playful-yellow/90 text-black">
            <Link to="/dashboard">Client Portal</Link>
          </Button>
          <Button asChild className="playful-btn bg-playful-blue hover:bg-playful-blue/90 text-white">
            <Link to="/admin">Admin Login</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          {[
            { icon: ShieldCheck, title: "Safe & Secure", color: "bg-playful-green" },
            { icon: CalendarCheck, title: "Easy Booking", color: "bg-playful-pink" },
            { icon: CreditCard, title: "Simple Billing", color: "bg-playful-blue" },
          ].map((feature, i) => (
            <div key={i} className="playful-card p-6 flex flex-col items-center space-y-4">
              <div className={`${feature.color} border-4 border-black p-3 rounded-xl`}>
                <feature.icon className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
              <h3 className="font-black text-xl">{feature.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}