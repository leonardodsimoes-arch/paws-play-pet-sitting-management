import React, { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Dog, Upload, ChevronLeft, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/store/use-auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import { DOG_BREEDS } from '@/lib/constants';
const dogSchema = z.object({
  name: z.string().min(1, "Name is required"),
  breed: z.string().min(1, "Breed is required"),
  otherBreed: z.string().optional(),
  age: z.number().min(0, "Age cannot be negative"),
  weight: z.number().min(0, "Weight cannot be negative"),
  behavior: z.enum(['friendly', 'shy', 'aggressive', 'reactive']),
  vaccinesUpToDate: z.boolean().refine(v => v === true, {
    message: "A vaccine card is required for registration"
  }),
  diet: z.string().min(1, "Diet details are important for fluffy safety!"),
  instructions: z.string(),
}).refine((data) => {
  if (data.breed === "Other" && (!data.otherBreed || data.otherBreed.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Please specify the breed",
  path: ["otherBreed"]
});
type DogFormValues = z.infer<typeof dogSchema>;
export function DogRegistration() {
  const navigate = useNavigate();
  const userId = useAuthStore(s => s.user?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasUploaded, setHasUploaded] = useState(false);
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<DogFormValues>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      name: '',
      breed: '',
      otherBreed: '',
      age: 0,
      weight: 0,
      behavior: 'friendly',
      vaccinesUpToDate: false,
      diet: '',
      instructions: ''
    }
  });
  const selectedBreed = watch('breed');
  const onSubmit: SubmitHandler<DogFormValues> = async (data) => {
    if (!userId) {
      toast.error("Session missing. Please login again.");
      return;
    }
    setIsSubmitting(true);
    try {
      const finalBreed = data.breed === "Other" ? data.otherBreed : data.breed;
      await api('/api/dogs', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          breed: finalBreed,
          ownerId: userId,
        })
      });
      toast.success("Dog registered successfully!", {
        description: `${data.name} is ready for some fluffy fun!`,
        icon: <Sparkles className="text-playful-yellow" />
      });
      navigate('/dashboard');
    } catch (err) {
      toast.error("Failed to register dog", { description: String(err) });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleMockUpload = () => {
    if (hasUploaded) return;
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setHasUploaded(true);
          setValue('vaccinesUpToDate', true);
          toast.success("Vaccine card verified!");
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };
  return (
    <AppLayout container>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto py-8 md:py-12"
      >
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 font-bold hover:bg-playful-yellow/20 rounded-xl"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Pack
        </Button>
        <div className="playful-card p-8 bg-white space-y-8">
          <header className="flex items-center gap-4 border-b-4 border-black pb-6">
            <div className="bg-playful-yellow border-4 border-black p-3 rounded-2xl rotate-3 shadow-solid-sm">
              <Dog className="w-8 h-8" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter">NEW FLUFFY FRIEND</h1>
              <p className="font-bold text-muted-foreground">Tell us everything about your buddy!</p>
            </div>
          </header>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-black text-lg text-foreground">Name</Label>
                <Input {...register('name')} placeholder="Buster" className="playful-input" />
                {errors.name && <p className="text-playful-pink font-bold text-xs">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-black text-lg text-foreground">Breed</Label>
                <Controller
                  name="breed"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="playful-input h-11 bg-white">
                        <SelectValue placeholder="Select a breed" />
                      </SelectTrigger>
                      <SelectContent className="border-4 border-black rounded-xl">
                        {DOG_BREEDS.map((breed) => (
                          <SelectItem key={breed} value={breed} className="font-bold">
                            {breed}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.breed && <p className="text-playful-pink font-bold text-xs">{errors.breed.message}</p>}
              </div>
              <AnimatePresence>
                {selectedBreed === "Other" && (
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ originY: 0 }}
                    className="space-y-2 md:col-span-2 overflow-hidden"
                  >
                    <Label className="font-black text-lg text-foreground">Specify Breed</Label>
                    <Input {...register('otherBreed')} placeholder="Tell us the breed!" className="playful-input" />
                    {errors.otherBreed && <p className="text-playful-pink font-bold text-xs">{errors.otherBreed.message}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-2">
                <Label className="font-black text-lg text-foreground">Age (Years)</Label>
                <Input type="number" {...register('age', { valueAsNumber: true })} className="playful-input" />
                {errors.age && <p className="text-playful-pink font-bold text-xs">{errors.age.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-black text-lg text-foreground">Weight (kg)</Label>
                <Input type="number" {...register('weight', { valueAsNumber: true })} className="playful-input" />
                {errors.weight && <p className="text-playful-pink font-bold text-xs">{errors.weight.message}</p>}
              </div>
            </div>
            <div className="space-y-4">
              <Label className="font-black text-lg text-foreground">Behavior Profile</Label>
              <Controller
                name="behavior"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-4"
                  >
                    {['friendly', 'shy', 'aggressive', 'reactive'].map((type) => (
                      <div
                        key={type}
                        className={`flex items-center space-x-2 border-4 border-black rounded-xl p-4 font-black transition-all ${field.value === type ? 'bg-playful-blue text-white shadow-solid-sm translate-x-[2px] translate-y-[2px]' : 'bg-white hover:bg-muted/30 cursor-pointer'}`}
                        onClick={() => field.onChange(type)}
                      >
                        <RadioGroupItem value={type} id={type} className="border-2 border-black bg-white" />
                        <Label htmlFor={type} className="capitalize cursor-pointer flex-1 font-black">{type}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
            </div>
            <div className="space-y-4">
              <Label className="font-black text-lg text-foreground">Health & Safety</Label>
              <div
                onClick={handleMockUpload}
                className={`border-4 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${hasUploaded ? 'bg-playful-green/10 border-playful-green shadow-solid-sm' : isUploading ? 'bg-muted/50 border-black' : 'bg-muted/30 border-black/30 hover:bg-muted/50 cursor-pointer'}`}
              >
                {isUploading ? (
                  <div className="w-full max-w-xs space-y-4 text-center">
                    <Loader2 className="w-10 h-10 mx-auto animate-spin text-playful-blue" />
                    <div className="w-full bg-black/10 rounded-full h-3 border-2 border-black overflow-hidden">
                      <div className="bg-playful-blue h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="font-black text-xs uppercase tracking-widest animate-pulse">Scanning Vaccine Card...</p>
                  </div>
                ) : hasUploaded ? (
                  <>
                    <CheckCircle2 className="w-12 h-12 mb-2 text-playful-green" strokeWidth={3} />
                    <p className="font-black text-xl italic text-playful-green uppercase">Vaccine Card Verified!</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mb-2 text-muted-foreground" />
                    <p className="font-black text-lg">Upload Fluffy Vaccine Card</p>
                    <p className="text-sm font-bold text-muted-foreground italic">Required for boarding services</p>
                  </>
                )}
              </div>
              {errors.vaccinesUpToDate && <p className="text-playful-pink font-bold text-xs">{errors.vaccinesUpToDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="font-black text-lg text-foreground">Dietary Needs</Label>
              <Textarea {...register('diet')} placeholder="Treat preferences, allergies, or morning/evening schedule..." className="playful-input min-h-[100px]" />
              {errors.diet && <p className="text-playful-pink font-bold text-xs">{errors.diet.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="font-black text-lg text-foreground">Extra Instructions</Label>
              <Textarea {...register('instructions')} placeholder="Fear of thunderstorms? Loves specific toys? Any quirks?" className="playful-input min-h-[100px]" />
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="playful-btn flex-1 bg-white border-black font-black" disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" className="playful-btn flex-1 bg-playful-pink text-white hover:bg-playful-pink/90 border-black font-black" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
                Save Profile
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </AppLayout>
  );
}