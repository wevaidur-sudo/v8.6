import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { type RemedySuggestions } from "@shared/astro-schema";
import { Gem, Music, Heart, Calendar, Palette } from "lucide-react";

interface RemediesProps {
  remedies: RemedySuggestions;
}

export function Remedies({ remedies }: RemediesProps) {
  return (
    <Card className="p-8 bg-card/95 backdrop-blur-sm border-primary/20">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
            Personalized Remedies
          </h2>
          <div className="h-0.5 w-24 bg-gradient-to-r from-primary to-transparent" />
          <p className="text-sm text-muted-foreground mt-4">
            Strengthen planetary influences through traditional Vedic remedies
          </p>
        </div>

        <Accordion type="multiple" className="space-y-4">
          {/* Gemstones */}
          {remedies.gemstones && remedies.gemstones.length > 0 && (
            <AccordionItem
              value="gemstones"
              className="border border-border rounded-md bg-muted/20 px-6"
              data-testid="accordion-gemstones"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Gem className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Gemstone Recommendations</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 space-y-4">
                {remedies.gemstones.map((gem, index) => (
                  <div key={index} className="p-4 rounded-md bg-card/50 border border-border">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">
                          {gem.primaryGemstone}
                        </h4>
                        <Badge variant="outline">{gem.planet}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="ml-2 text-foreground">{gem.weight}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Metal:</span>
                          <span className="ml-2 text-foreground">{gem.metal}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Finger:</span>
                          <span className="ml-2 text-foreground">{gem.finger}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Day:</span>
                          <span className="ml-2 text-foreground">{gem.dayToWear}</span>
                        </div>
                      </div>
                      {gem.alternativeGemstones.length > 0 && (
                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground mb-2">Alternatives:</p>
                          <div className="flex flex-wrap gap-2">
                            {gem.alternativeGemstones.map((alt, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {alt}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Mantras */}
          {remedies.mantras && remedies.mantras.length > 0 && (
            <AccordionItem
              value="mantras"
              className="border border-border rounded-md bg-muted/20 px-6"
              data-testid="accordion-mantras"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Mantra Recommendations</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 space-y-4">
                {remedies.mantras.map((mantra, index) => (
                  <div key={index} className="p-4 rounded-md bg-card/50 border border-border">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{mantra.planet}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Sanskrit:</p>
                          <p className="text-lg font-serif text-primary">
                            {mantra.mantraDevanagari}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Transliteration:</p>
                          <p className="text-sm text-foreground italic">
                            {mantra.mantra}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs pt-2">
                        <div>
                          <span className="text-muted-foreground">Repetitions:</span>
                          <span className="ml-1 text-foreground font-medium">
                            {mantra.repetitions}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time:</span>
                          <span className="ml-1 text-foreground">{mantra.bestTime}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="ml-1 text-foreground">{mantra.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Charity & Behavioral Guidance */}
          {remedies.charityRecommendations && remedies.charityRecommendations.length > 0 && (
            <AccordionItem
              value="charity"
              className="border border-border rounded-md bg-muted/20 px-6"
              data-testid="accordion-charity"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Charitable Actions</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <ul className="space-y-2">
                  {remedies.charityRecommendations.map((charity, index) => (
                    <li key={index} className="text-sm text-foreground/90 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {charity}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Fasting Days */}
          {remedies.fastingDays && remedies.fastingDays.length > 0 && (
            <AccordionItem
              value="fasting"
              className="border border-border rounded-md bg-muted/20 px-6"
              data-testid="accordion-fasting"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Fasting Recommendations</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <div className="flex flex-wrap gap-2">
                  {remedies.fastingDays.map((day, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {day}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Color Therapy */}
          {remedies.colorTherapy && remedies.colorTherapy.length > 0 && (
            <AccordionItem
              value="colors"
              className="border border-border rounded-md bg-muted/20 px-6"
              data-testid="accordion-colors"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Color Therapy</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <ul className="space-y-2">
                  {remedies.colorTherapy.map((color, index) => (
                    <li key={index} className="text-sm text-foreground/90 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {color}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </Card>
  );
}
