import React from 'react';
import { Link } from 'react-router-dom';
import { Dog, ShieldCheck, CalendarCheck, CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/use-auth-store';
export function HomePage() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const userRole = useAuthStore(s => s.user?.role);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-12 md:py-24 flex flex-col items-center text-center space-y-12">
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: -6 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative"
        >
          <div className="w-28 h-28 bg-playful-yellow border-4 border-black rounded-3xl shadow-solid flex items-center justify-center">
            <Dog className="w-16 h-16" strokeWidth={3} />
          </div>
          <motion.div
            animate={{ rotate: [12, -12, 12] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-4 -right-4 w-14 h-14 bg-playful-pink border-4 border-black rounded-full shadow-solid flex items-center justify-center"
          >
            <Sparkles className="text-white w-8 h-8" />
          </motion.div>
        </motion.div>
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-7xl md:text-9xl font-black leading-none tracking-tight">
            FLU<span className="text-playful-pink">FFY</span>
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-muted-foreground leading-snug">
            Where every tail wags with joy! <br className="hidden md:block" />
            Premium boarding, daycare, and walks for your best friends.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
          {isAuthenticated ? (
            <Button asChild className="playful-btn bg-playful-yellow hover:bg-playful-yellow/90 text-black text-xl h-16 sm:col-span-2">
              <Link to={userRole === 'admin' ? '/admin' : '/dashboard'}>
                Go to {userRole === 'admin' ? 'Admin Hub' : 'My Dashboard'} <ArrowRight className="ml-2" />
              </Link>
            </Button>
          ) : (
            <>
              {/* Swapped order: Join the Pack (Blue) first, Pack Login (Yellow) second */}
              <Button asChild className="playful-btn bg-playful-blue hover:bg-playful-blue/90 text-white text-xl h-16">
                <Link to="/register">Join the Pack</Link>
              </Button>
              <Button asChild className="playful-btn bg-playful-yellow hover:bg-playful-yellow/90 text-black text-xl h-16">
                <Link to="/login">Pack Login</Link>
              </Button>
            </>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 w-full">
          {[
            { icon: ShieldCheck, title: "Fluffy Safe", color: "bg-playful-green", desc: "Vetted & certified sitters" },
            { icon: CalendarCheck, title: "Simple Booking", color: "bg-playful-pink", desc: "Book in just 3 clicks" },
            { icon: CreditCard, title: "Easy Invoices", color: "bg-playful-blue", desc: "Transparent Fluffy pricing" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="playful-card p-8 flex flex-col items-center space-y-4"
            >
              <div className={`${feature.color} border-4 border-black p-4 rounded-2xl`}>
                <feature.icon className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-2xl">{feature.title}</h3>
                <p className="font-bold text-muted-foreground">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}