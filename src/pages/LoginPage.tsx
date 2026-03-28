import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Dog, KeyRound, Mail, Loader2, Sparkles, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/store/use-auth-store';
import { AuthResponse } from '@shared/types';
import { motion } from 'framer-motion';
const loginSchema = z.object({
  email: z.string().email("Please enter a valid fluffy email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginFormValues = z.infer<typeof loginSchema>;
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore(s => s.setAuth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });
  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const data = await api<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(values)
      });
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`, { icon: <Sparkles className="text-playful-yellow" /> });
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error("Login failed", { description: "Check your email and password!" });
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-playful-pink border-4 border-black rounded-3xl shadow-solid mb-4 rotate-3">
            <Dog className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Pack Login</h1>
          <p className="font-bold text-muted-foreground">Ready for some fluffy adventures?</p>
        </header>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label className="font-black text-lg">Fluffy Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                {...register('email')}
                type="email"
                placeholder="alex@fluffy.com"
                className="playful-input pl-10"
              />
            </div>
            {errors.email && <p className="text-playful-pink font-bold text-sm">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="font-black text-lg">Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="playful-input pl-10"
              />
            </div>
            {errors.password && <p className="text-playful-pink font-bold text-sm">{errors.password.message}</p>}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="playful-btn w-full bg-playful-blue text-white hover:bg-playful-blue/90 h-14 text-xl font-black"
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "LOG IN"}
          </Button>
        </form>
        <div className="text-center pt-2">
          <p className="font-bold text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-playful-blue hover:underline font-black inline-flex items-center gap-1">
              Join the Pack <ArrowRight size={16} />
            </Link>
          </p>
        </div>
        <div className="p-4 bg-playful-yellow/20 rounded-2xl border-2 border-black/10 space-y-2">
          <p className="text-xs font-black uppercase flex items-center gap-2 text-playful-blue">
            <Info size={14} /> Demo Access
          </p>
          <div className="text-[11px] font-bold space-y-1">
            <p><span className="text-muted-foreground">Admin:</span> admin@fluffy.com / password123</p>
            <p><span className="text-muted-foreground">Client:</span> alex@fluffy.com / password123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}