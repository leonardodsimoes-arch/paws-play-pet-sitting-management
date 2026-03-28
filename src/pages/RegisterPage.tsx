import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Dog, Mail, User as UserIcon, Lock, Loader2, Sparkles, Phone, MapPin, LifeBuoy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { motion } from 'framer-motion';
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid fluffy email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type RegisterFormValues = z.infer<typeof registerSchema>;
export function RegisterPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      emergencyName: '',
      emergencyPhone: ''
    }
  });
  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(values)
      });
      toast.success("Welcome to the Pack!", {
        description: "Your account has been created. Please log in to continue.",
        icon: <Sparkles className="text-playful-yellow" />
      });
      navigate('/login');
    } catch (err) {
      toast.error("Registration failed", { description: String(err) });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-2xl w-full playful-card p-8 md:p-12 bg-white space-y-10"
      >
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-playful-blue border-4 border-black rounded-3xl shadow-solid mb-4 -rotate-3">
            <Dog className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Join the Pack</h1>
          <p className="font-bold text-muted-foreground">The beginning of a fluffy friendship!</p>
        </header>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section: Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black/10 pb-2">
              <UserIcon className="text-playful-blue" size={20} strokeWidth={3} />
              <h2 className="font-black text-xl tracking-tight italic uppercase">Account Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-black text-sm">Full Name</Label>
                <Input {...register('name')} placeholder="Alex Barker" className="playful-input" />
                {errors.name && <p className="text-playful-pink font-bold text-xs">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-black text-sm">Fluffy Email</Label>
                <Input {...register('email')} type="email" placeholder="alex@fluffy.com" className="playful-input" />
                {errors.email && <p className="text-playful-pink font-bold text-xs">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-black text-sm">Password</Label>
                <Input {...register('password')} type="password" placeholder="••••••••" className="playful-input" />
                {errors.password && <p className="text-playful-pink font-bold text-xs">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-black text-sm">Confirm Password</Label>
                <Input {...register('confirmPassword')} type="password" placeholder="••••••••" className="playful-input" />
                {errors.confirmPassword && <p className="text-playful-pink font-bold text-xs">{errors.confirmPassword.message}</p>}
              </div>
            </div>
          </div>
          {/* Section: Contact & Home */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black/10 pb-2">
              <MapPin className="text-playful-pink" size={20} strokeWidth={3} />
              <h2 className="font-black text-xl tracking-tight italic uppercase">Your Fluffy Home</h2>
            </div>
            <div className="bg-playful-yellow/5 border-2 border-black/10 p-4 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-black text-sm">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input {...register('phone')} placeholder="(555) 123-4567" className="playful-input pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-sm">Address</Label>
                  <Input {...register('address')} placeholder="123 Puppy Lane" className="playful-input" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-2">
                  <Label className="font-black text-sm">City</Label>
                  <Input {...register('city')} placeholder="Dogtown" className="playful-input" />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label className="font-black text-sm">State</Label>
                  <Input {...register('state')} placeholder="FL" className="playful-input" />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label className="font-black text-sm">Zip Code</Label>
                  <Input {...register('zip')} placeholder="12345" className="playful-input" />
                </div>
              </div>
            </div>
          </div>
          {/* Section: Emergency */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black/10 pb-2">
              <LifeBuoy className="text-playful-blue" size={20} strokeWidth={3} />
              <h2 className="font-black text-xl tracking-tight italic uppercase">Emergency Backup</h2>
            </div>
            <div className="bg-playful-blue/5 border-2 border-black/10 p-4 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-black text-sm">Contact Name</Label>
                  <Input {...register('emergencyName')} placeholder="Emergency Contact Name" className="playful-input" />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-sm">Contact Phone</Label>
                  <Input {...register('emergencyPhone')} placeholder="(555) 987-6543" className="playful-input" />
                </div>
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="playful-btn w-full bg-playful-pink text-white hover:bg-playful-pink/90 h-16 text-2xl font-black mt-6 shadow-solid hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-solid-sm"
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-6 w-6" />}
            JOIN THE PACK!
          </Button>
        </form>
        <div className="text-center">
          <p className="font-bold text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-playful-blue hover:underline font-black inline-flex items-center gap-1">
              Login here <ArrowRight size={16} />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}