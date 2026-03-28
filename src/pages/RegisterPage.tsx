import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Dog, Mail, User as UserIcon, Lock, Loader2, Sparkles } from 'lucide-react';
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
  confirmPassword: z.string()
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
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  });
  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password
        })
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
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full playful-card p-8 bg-white space-y-8"
      >
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-playful-blue border-4 border-black rounded-3xl shadow-solid mb-4 -rotate-3">
            <Dog className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Join the Pack</h1>
          <p className="font-bold text-muted-foreground">Start your fluffy journey today!</p>
        </header>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-black text-lg">Full Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input {...register('name')} placeholder="Alex Barker" className="playful-input pl-10" />
            </div>
            {errors.name && <p className="text-playful-pink font-bold text-sm">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="font-black text-lg">Fluffy Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input {...register('email')} type="email" placeholder="alex@fluffy.com" className="playful-input pl-10" />
            </div>
            {errors.email && <p className="text-playful-pink font-bold text-sm">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="font-black text-lg">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input {...register('password')} type="password" placeholder="••••••••" className="playful-input pl-10" />
            </div>
            {errors.password && <p className="text-playful-pink font-bold text-sm">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="font-black text-lg">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input {...register('confirmPassword')} type="password" placeholder="••••••••" className="playful-input pl-10" />
            </div>
            {errors.confirmPassword && <p className="text-playful-pink font-bold text-sm">{errors.confirmPassword.message}</p>}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="playful-btn w-full bg-playful-pink text-white hover:bg-playful-pink/90 h-14 text-xl font-black mt-4"
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "SIGN UP"}
          </Button>
        </form>
        <div className="text-center">
          <p className="font-bold text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-playful-blue hover:underline font-black">
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}