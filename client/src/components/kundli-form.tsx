import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { birthDataSchema, type BirthData, type City } from "@shared/astro-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { X, MapPin, Calendar, Clock, User, Loader2 } from "lucide-react";
import { CitySearch } from "@/components/city-search";
import { generateKundli, validateBirthData } from "@/lib/kundli-generator";
import { useToast } from "@/hooks/use-toast";

interface KundliFormProps {
  onClose: () => void;
}

export function KundliForm({ onClose }: KundliFormProps) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<BirthData>({
    resolver: zodResolver(birthDataSchema),
    defaultValues: {
      name: "",
      dateOfBirth: "",
      timeOfBirth: "",
      placeOfBirth: "",
      latitude: 0,
      longitude: 0,
      timezone: 5.5, // IST default
      gender: "male",
    },
  });

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    form.setValue("placeOfBirth", `${city.city}, ${city.state}`);
    form.setValue("latitude", city.latitude);
    form.setValue("longitude", city.longitude);
  };

  const handleSubmit = async (data: BirthData) => {
    try {
      setIsGenerating(true);

      // Validate birth data
      const validation = validateBirthData(data);
      if (!validation.valid) {
        toast({
          title: "Invalid Data",
          description: validation.errors.join(", "),
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      // Generate Kundli
      const kundli = await generateKundli(data);

      // Save to localStorage
      const savedKundlis = localStorage.getItem("kundlis");
      const kundlis = savedKundlis ? JSON.parse(savedKundlis) : [];
      kundlis.push(kundli);
      localStorage.setItem("kundlis", JSON.stringify(kundlis));

      toast({
        title: "Success!",
        description: "Your Kundli has been generated successfully.",
      });

      // Navigate to results page
      navigate(`/kundli/${kundli.id}`);
    } catch (error) {
      console.error("Error generating Kundli:", error);
      toast({
        title: "Error",
        description: "Failed to generate Kundli. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="relative p-8 bg-card/95 backdrop-blur-lg border-primary/20 shadow-2xl">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4"
        onClick={onClose}
        data-testid="button-close-form"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
          Birth Details
        </h2>
        <div className="h-0.5 w-24 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
        <p className="text-sm text-muted-foreground mt-4">
          Enter accurate birth information for precise calculations
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your full name"
                    className="bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    data-testid="input-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Date of Birth
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      data-testid="input-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Time of Birth
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="time"
                      className="bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      data-testid="input-time"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* City Search */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Place of Birth
            </Label>
            <CitySearch onCitySelect={handleCitySelect} />
            {selectedCity && (
              <div className="mt-4 p-4 rounded-md bg-muted/30 border border-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">City:</span>
                    <span className="ml-2 text-foreground font-medium">
                      {selectedCity.city}, {selectedCity.state}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Coordinates:</span>
                    <span className="ml-2 text-foreground font-mono text-xs">
                      {selectedCity.latitude.toFixed(4)}°N,{" "}
                      {selectedCity.longitude.toFixed(4)}°E
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gender Selection */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger
                      className="bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      data-testid="select-gender"
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="pt-6 flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-testid="button-cancel"
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 animate-glow-pulse"
              data-testid="button-calculate"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Calculate Kundli"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
