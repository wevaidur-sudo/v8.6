import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MapPin } from "lucide-react";
import { type City } from "@shared/astro-schema";
import citiesData from "../../../attached_assets/cities_1760768872318.json";

interface CitySearchProps {
  onCitySelect: (city: City) => void;
}

export function CitySearch({ onCitySelect }: CitySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [showResults, setShowResults] = useState(false);

  const cities = citiesData as City[];

  useEffect(() => {
    if (searchTerm.length < 2) {
      setFilteredCities([]);
      setShowResults(false);
      return;
    }

    const filtered = cities
      .filter(
        (city) =>
          city.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          city.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
          city.district.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 50); // Limit to 50 results

    setFilteredCities(filtered);
    setShowResults(true);
  }, [searchTerm]);

  const handleCitySelect = (city: City) => {
    setSearchTerm(`${city.city}, ${city.state}`);
    setShowResults(false);
    onCitySelect(city);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for a city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
          className="pl-10 bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
          data-testid="input-city-search"
        />
      </div>

      {/* Results Dropdown */}
      {showResults && filteredCities.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-popover border border-popover-border rounded-md shadow-lg">
          <ScrollArea className="h-[300px]">
            <div className="p-2 space-y-1">
              {filteredCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  className="w-full text-left px-3 py-2.5 rounded-md hover-elevate active-elevate-2 transition-colors"
                  data-testid={`city-option-${city.id}`}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">
                        {city.city}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {city.district}, {city.state}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-1">
                        {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {showResults && filteredCities.length === 0 && searchTerm.length >= 2 && !searchTerm.includes(',') && (
        <div className="absolute z-50 w-full mt-2 bg-popover border border-popover-border rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground">
          No cities found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}
