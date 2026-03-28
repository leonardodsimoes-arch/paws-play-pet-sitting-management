import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Dog, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
const dogSchema = z.object({
  name: z.string().min(1, "Name is required"),
  breed: z.string().min(1, "Breed is required"),
  age: z.coerce.number().min(0),
  weight: z.coerce.number().min(0),
  behavior: z.enum(['friendly', 'shy', 'aggressive', 'reactive']),
  vaccinesUpToDate: z.boolean().default(false),
  diet: z.string().min(1, "Diet details required"),
  instructions: z.string().optional(),
});
type DogFormValues = z.infer<typeof dogSchema>;
export function DogRegistration() {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DogFormValues>({
    resolver: zodResolver(dogSchema),
    defaultValues: { behavior: 'friendly', vaccinesUpToDate: false }
  });
  const onSubmit = (data: DogFormValues) => {
    console.log(data);
    toast.success("Dog registered successfully!", { description: `${data.name} is ready for play!` });
    navigate('/dashboard');
  };
  const behaviorValue = watch('behavior');
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="playful-card p-8 bg-white space-y-8">
        <header className="flex items-center gap-4 border-b-4 border-black pb-6">
          <div className="bg-playful-yellow border-4 border-black p-3 rounded-2xl">
            <Dog className="w-8 h-8" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-3xl font-black">Register New Dog</h1>
            <p className="font-bold text-muted-foreground">Tell us everything about your buddy!</p>
          </div>
        </header>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-black text-lg">Name</Label>
              <Input {...register('name')} placeholder="Buster" className="playful-input" />
              {errors.name && <p className="text-playful-pink font-bold text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="font-black text-lg">Breed</Label>
              <Input {...register('breed')} placeholder="Golden Retriever" className="playful-input" />
              {errors.breed && <p className="text-playful-pink font-bold text-sm">{errors.breed.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="font-black text-lg">Age (Years)</Label>
              <Input type="number" {...register('age')} className="playful-input" />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-lg">Weight (kg)</Label>
              <Input type="number" {...register('weight')} className="playful-input" />
            </div>
          </div>
          <div className="space-y-4">
            <Label className="font-black text-lg">Behavior Profile</Label>
            <RadioGroup 
              value={behaviorValue} 
              onValueChange={(val: any) => setValue('behavior', val)}
              className="grid grid-cols-2 gap-4"
            >
              {['friendly', 'shy', 'aggressive', 'reactive'].map((type) => (
                <div key={type} className={`flex items-center space-x-2 border-4 border-black rounded-xl p-4 font-black transition-colors ${behaviorValue === type ? 'bg-playful-blue text-white' : 'bg-white'}`}>
                  <RadioGroupItem value={type} id={type} className="border-2 border-black bg-white" />
                  <Label htmlFor={type} className="capitalize cursor-pointer">{type}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-4">
            <Label className="font-black text-lg">Health & Safety</Label>
            <div className="flex items-center space-x-2 border-4 border-black p-4 rounded-xl bg-playful-green/10">
              <Checkbox 
                id="vaccines" 
                onCheckedChange={(checked) => setValue('vaccinesUpToDate', !!checked)}
                className="border-2 border-black w-6 h-6 data-[state=checked]:bg-playful-green" 
              />
              <Label htmlFor="vaccines" className="font-bold text-lg leading-none cursor-pointer">
                Vaccines are up to date
              </Label>
            </div>
            <div className="border-4 border-dashed border-black/30 rounded-xl p-8 flex flex-col items-center justify-center bg-muted/30">
              <Upload className="w-10 h-10 mb-2 text-muted-foreground" />
              <p className="font-bold text-muted-foreground">Upload Vaccine Card (PDF or JPG)</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-black text-lg">Dietary Needs</Label>
            <Textarea {...register('diet')} placeholder="Describe food type, timing, and allergies..." className="playful-input min-h-[100px]" />
          </div>
          <div className="space-y-2">
            <Label className="font-black text-lg">Extra Instructions</Label>
            <Textarea {...register('instructions')} placeholder="Any quirks or special requirements?" className="playful-input min-h-[100px]" />
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="playful-btn flex-1 bg-white">Cancel</Button>
            <Button type="submit" className="playful-btn flex-1 bg-playful-pink text-white hover:bg-playful-pink/90">Save Profile</Button>
          </div>
        </form>
      </div>
    </div>
  );
}