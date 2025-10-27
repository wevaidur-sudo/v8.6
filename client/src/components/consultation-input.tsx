import { useState } from "react";
import { Calendar, Clock, MapPin, Send, Mic, HelpCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CitySearch } from "@/components/city-search";
import { birthDataSchema, type BirthData, type City } from "@shared/astro-schema";

interface ConsultationInputProps {
  onBirthDataSubmit: (data: BirthData) => void;
  onTextQuery: (query: string) => void;
  onShowBirthForm: () => void;
  disabled?: boolean;
}

export function ConsultationInput({
  onBirthDataSubmit,
  onTextQuery,
  onShowBirthForm,
  disabled = false,
}: ConsultationInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState<"text" | "birth">("text");
  
  // Birth data states
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const handleSubmit = () => {
    if (disabled) return;

    if (mode === "text" && inputValue.trim()) {
      onTextQuery(inputValue);
      setInputValue("");
    } else if (mode === "birth" && name && dateOfBirth && timeOfBirth && selectedCity) {
      const birthData: BirthData = {
        name,
        dateOfBirth,
        timeOfBirth,
        placeOfBirth: `${selectedCity.city}, ${selectedCity.state}`,
        latitude: selectedCity.latitude,
        longitude: selectedCity.longitude,
        timezone: 5.5, // IST default
        gender: "male", // Default, could add selector
      };
      
      onBirthDataSubmit(birthData);
      
      // Reset form
      setName("");
      setDateOfBirth("");
      setTimeOfBirth("");
      setSelectedCity(null);
      setMode("text");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full">
      {/* Main Input Bar */}
      <div className="relative bg-card/40 backdrop-blur-xl border-2 border-primary/30 rounded-2xl shadow-2xl shadow-primary/5">
        <div className="flex items-center gap-2 p-2">
          {/* Birth Details Button - Opens Form */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary/10 hover:text-primary shrink-0"
            onClick={onShowBirthForm}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Sparkles className="w-5 h-5" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Enter birth details</p>
              </TooltipContent>
            </Tooltip>
          </Button>

          <div className="h-8 w-px bg-border/50 shrink-0" />

          {/* Voice Input (Optional) */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary/10 hover:text-primary shrink-0"
            disabled
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Mic className="w-5 h-5 opacity-50" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Voice input (coming soon)</p>
              </TooltipContent>
            </Tooltip>
          </Button>

          {/* Main Input Field */}
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setMode("text");
            }}
            onKeyPress={handleKeyPress}
            placeholder={
              mode === "birth" && (name || dateOfBirth || timeOfBirth || selectedCity)
                ? "Complete your birth details using the icons..."
                : "Ask about your career, marriage, health... or enter birth details"
            }
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
            disabled={disabled}
          />

          {/* Help Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10 hover:text-primary shrink-0"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Click the calendar, clock, and location icons to enter your birth details,
                or type a question about astrology, career, relationships, or health.
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Send/Ask Button */}
          <Button
            onClick={handleSubmit}
            disabled={disabled || (!inputValue.trim() && !(name && dateOfBirth && timeOfBirth && selectedCity))}
            size="icon"
            className="shrink-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        {/* Birth Data Summary (when in birth mode) */}
        {mode === "birth" && (name || dateOfBirth || timeOfBirth || selectedCity) && (
          <div className="px-4 pb-3 pt-1 border-t border-primary/10">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {name && (
                <span className="bg-primary/10 px-2 py-1 rounded">
                  👤 {name}
                </span>
              )}
              {dateOfBirth && (
                <span className="bg-primary/10 px-2 py-1 rounded">
                  📅 {dateOfBirth}
                </span>
              )}
              {timeOfBirth && (
                <span className="bg-primary/10 px-2 py-1 rounded">
                  🕐 {timeOfBirth}
                </span>
              )}
              {selectedCity && (
                <span className="bg-primary/10 px-2 py-1 rounded">
                  📍 {selectedCity.city}, {selectedCity.state}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="mt-2 text-center">
        <p className="text-xs text-muted-foreground/70">
          Enter your birth details for personalized insights, or ask general astrology questions
        </p>
      </div>
    </div>
  );
}
