import React, { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Dog, Upload, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
const dogSchema = z.object({
  name: z.string().min(1, "Name is required"),
  breed: z.string().min(1, "Breed is required"),
  age: z.number().min(0),
  weight: z.number().min(0),
  behavior: z.enum(['friendly', 'shy', 'aggressive', 'reactive']),
  vaccinesUpToDate: z.boolean(),
  diet: z.string().min(1, "Diet details required"),
  instructions: z.string(),
});
type DogFormValues = z.infer<typeof dogSchema>;
export function DogRegistration() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<DogFormValues>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      name: '',
      breed: '',
      age: 0,
      weight: 0,
      behavior: 'friendly',
      vaccinesUpToDate: false,
      diet: '',
      instructions: ''
    }
  });
  const onSubmit: SubmitHandler<DogFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      await api('/api/dogs', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          ownerId: 'u1',
        })
      });
      toast.success("Dog registered successfully!", { description: `${data.name} is ready for some fluffy fun!` });
      navigate('/dashboard');
    } catch (err) {
      toast.error("Failed to register dog", { description: String(err) });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleMockUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setHasUploaded(true);
      setValue('vaccinesUpToDate', true);
      toast.success("Vaccine card processed!");
    }, 1500);
  };
  return (
    <AppLayout container>
      <div className="max-w-3xl mx-auto py-8 md:py-12">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 font-bold hover:bg-playful-yellow/20"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Pack
        </Button>
        <div className="playful-card p-8 bg-white space-y-8">
          <header className="flex items-center gap-4 border-b-4 border-black pb-6">
            <div className="bg-playful-yellow border-4 border-black p-3 rounded-2xl">
              <Dog className="w-8 h-8" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-3xl font-black">New Fluffy Friend</h1>
              <p className="font-bold text-muted-foreground">Tell us everything about your buddy!</p>
            </div>
          </header>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-black text-lg text-foreground">Name</Label>
                <Input {...register('name')} placeholder="Buster" className="playful-input" />
                {errors.name && <p className="text-playful-pink font-bold text-sm">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-black text-lg text-foreground">Breed</Label>
                <Input {...register('breed')} placeholder="Golden Retriever" className="playful-input" />
                {errors.breed && <p className="text-playful-pink font-bold text-sm">{errors.breed.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-black text-lg text-foreground">Age (Years)</Label>
                <Input type="number" {...register('age', { valueAsNumber: true })} className="playful-input" />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-lg text-foreground">Weight (kg)</Label>
                <Input type="number" {...register('weight', { valueAsNumber: true })} className="playful-input" />
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
                        className={`flex items-center space-x-2 border-4 border-black rounded-xl p-4 font-black transition-colors ${field.value === type ? 'bg-playful-blue text-white' : 'bg-white'}`}
                      >
                        <RadioGroupItem value={type} id={type} className="border-2 border-black bg-white" />
                        <Label htmlFor={type} className="capitalize cursor-pointer flex-1">{type}</Label>
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
                className={`border-4 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${hasUploaded ? 'bg-playful-green/10 border-playful-green shadow-solid-sm' : 'bg-muted/30 border-black/30 hover:bg-muted/50'}`}
              >
                {isUploading ? (
                  <Loader2 className="w-10 h-10 mb-2 animate-spin text-playful-blue" />
                ) : hasUploaded ? (
                  <CheckCircle2 className="w-10 h-10 mb-2 text-playful-green" />
                ) : (
                  <Upload className="w-10 h-10 mb-2 text-muted-foreground" />
                )}
                <p className="font-black text-lg">{isUploading ? "Reading Card..." : hasUploaded ? "Vaccine Card Verified!" : "Upload Fluffy Vaccine Card"}</p>
                <p className="text-sm font-bold text-muted-foreground">Click to simulate upload</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-black text-lg text-foreground">Dietary Needs</Label>
              <span className="text-xs font-bold text-muted-foreground block -mt-1 mb-2">Required for the snack bar!</span>
              <Textarea {...register('diet')} placeholder="Describe food type, timing, and allergies..." className="playful-input min-h-[100px]" />
              {errors.diet && <p className="text-playful-pink font-bold text-sm">{errors.diet.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="font-black text-lg text-foreground">Extra Instructions</Label>
              <Textarea {...register('instructions')} placeholder="Any quirks or special requirements?" className="playful-input min-h-[100px]" />
            </div>
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="playful-btn flex-1 bg-white border-black" disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" className="playful-btn flex-1 bg-playful-pink text-white hover:bg-playful-pink/90 border-black" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                Save Profile
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}