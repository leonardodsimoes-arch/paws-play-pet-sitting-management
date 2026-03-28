import React from 'react';
import { LayoutDashboard, Users, AlertTriangle, Utensils, Star } from 'lucide-react';
import { MOCK_DOGS, MOCK_BOOKINGS } from '@shared/mock-data';
export function AdminDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const arrivingToday = MOCK_BOOKINGS.filter(b => b.startDate.startsWith(today));
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3">
              Fluffy Admin <Star className="text-playful-yellow fill-playful-yellow" />
            </h1>
            <p className="font-bold text-muted-foreground">Operations Overview</p>
          </div>
          <div className="bg-playful-blue text-white border-4 border-black px-6 py-3 rounded-2xl font-black shadow-solid">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="playful-card p-6 bg-playful-yellow flex items-center gap-4">
            <div className="bg-black text-white p-3 rounded-xl"><Users /></div>
            <div>
              <p className="font-black text-3xl">{MOCK_DOGS.length}</p>
              <p className="font-bold text-sm">Fluffy Roster</p>
            </div>
          </div>
          <div className="playful-card p-6 bg-playful-green flex items-center gap-4">
            <div className="bg-black text-white p-3 rounded-xl"><LayoutDashboard /></div>
            <div>
              <p className="font-black text-3xl">{arrivingToday.length || 2}</p>
              <p className="font-bold text-sm">Check-ins Today</p>
            </div>
          </div>
          <div className="playful-card p-6 bg-playful-pink flex items-center gap-4 text-white">
            <div className="bg-white text-black p-3 rounded-xl"><AlertTriangle /></div>
            <div>
              <p className="font-black text-3xl">2</p>
              <p className="font-bold text-sm">Priority Alerts</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-black">Daily Fluffy Schedule</h2>
            <div className="space-y-4">
              {MOCK_BOOKINGS.map(booking => {
                const dog = MOCK_DOGS.find(d => d.id === booking.dogId);
                return (
                  <div key={booking.id} className="playful-card p-4 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-playful-blue border-2 border-black rounded-lg flex items-center justify-center font-black text-white uppercase">
                        {dog?.name[0]}
                      </div>
                      <div>
                        <h4 className="font-black text-lg">{dog?.name}</h4>
                        <p className="text-xs font-bold text-muted-foreground capitalize">{booking.serviceType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm">07:00 AM</p>
                      <p className="text-xs font-bold text-muted-foreground uppercase">Scheduled</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-playful-pink">Care & Safety Notices</h2>
            <div className="space-y-4">
              {MOCK_DOGS.filter(d => d.behavior === 'aggressive' || d.behavior === 'reactive' || d.instructions).map(dog => (
                <div key={dog.id} className="playful-card p-5 border-l-8 border-l-playful-pink bg-playful-pink/5">
                  <div className="flex items-start gap-4">
                    <div className="bg-playful-pink p-2 rounded-lg">
                      <AlertTriangle className="text-white w-5 h-5" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h4 className="font-black text-lg">{dog.name} <span className="text-sm font-bold text-muted-foreground">— {dog.breed}</span></h4>
                      <div className="flex flex-wrap gap-2">
                        {dog.behavior === 'reactive' && (
                          <span className="bg-playful-pink text-white px-3 py-1 rounded-full text-xs font-black">REACTIVE</span>
                        )}
                        <span className="bg-playful-blue/10 text-playful-blue px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border border-playful-blue/20">
                          <Utensils className="w-3 h-3" /> DIET: {dog.diet.slice(0, 25)}...
                        </span>
                      </div>
                      <p className="text-sm font-bold text-muted-foreground bg-white/50 border-2 border-black/5 p-3 rounded-xl italic">
                        "{dog.instructions}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}