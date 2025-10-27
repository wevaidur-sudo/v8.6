import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CitySearch } from "@/components/city-search";
import { Calendar, Clock, MapPin, User, Sparkles } from "lucide-react";
import { type BirthData, type City } from "@shared/astro-schema";

interface BirthDetailFormProps {
  onSubmit: (data: BirthData) => void;
  onCancel?: () => void;
}

export function BirthDetailForm({ onSubmit, onCancel }: BirthDetailFormProps) {
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const handleSubmit = () => {
    if (!name || !dateOfBirth || !timeOfBirth || !selectedCity) return;

    const birthData: BirthData = {
      name,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth: `${selectedCity.city}, ${selectedCity.state}`,
      latitude: selectedCity.latitude,
      longitude: selectedCity.longitude,
      timezone: 5.5, // IST default
      gender: "male", // Default
    };

    onSubmit(birthData);
  };

  const isFormComplete = name && dateOfBirth && timeOfBirth && selectedCity;

  return (
    <Card className="p-6 bg-card/60 backdrop-blur-xl border-2 border-primary/30 shadow-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-xl font-semibold">Enter Your Birth Details</h3>
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-sm text-muted-foreground">
            Sage Parashara will analyze your celestial blueprint
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="bg-background/50 border-primary/20 focus:border-primary"
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Date of Birth
            </label>
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="bg-background/50 border-primary/20 focus:border-primary"
            />
          </div>

          {/* Time of Birth */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Time of Birth
            </label>
            <Input
              type="time"
              value={timeOfBirth}
              onChange={(e) => setTimeOfBirth(e.target.value)}
              className="bg-background/50 border-primary/20 focus:border-primary"
              step="60"
            />
          </div>

          {/* Place of Birth */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Place of Birth
            </label>
            <CitySearch onCitySelect={(city) => setSelectedCity(city)} />
            {selectedCity && (
              <p className="text-xs text-primary/80 mt-1">
                Selected: {selectedCity.city}, {selectedCity.state}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-primary/30"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!isFormComplete}
            className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Consult Sage Parashara
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="pt-4 border-t border-primary/10">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${name ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-2 h-2 rounded-full ${dateOfBirth ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-2 h-2 rounded-full ${timeOfBirth ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-2 h-2 rounded-full ${selectedCity ? "bg-primary" : "bg-muted"}`} />
            <span className="ml-2">
              {[name, dateOfBirth, timeOfBirth, selectedCity].filter(Boolean).length} of 4 fields completed
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
