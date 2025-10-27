import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type AllDashaSystems,
  type DashaSystem,
  type YoginiDashaSystem,
  type AshtottariDashaSystem,
  type CharaDashaSystem,
  type KalachakraDashaSystem,
  type MahadashaPeriod,
  type YoginiMahadasha,
  type AshtottariMahadasha,
  type CharaMahadasha,
  type KalachakraMahadasha,
  DashaPlanet,
} from "@shared/astro-schema";
import { Calendar, Clock } from "lucide-react";

interface AllDashaSystemsProps {
  allDashaSystems: AllDashaSystems;
}

export function AllDashaSystems({ allDashaSystems }: AllDashaSystemsProps) {
  return (
    <Card className="p-8 bg-card/95 backdrop-blur-sm border-primary/20">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
            Dasha Systems
          </h2>
          <div className="h-0.5 w-24 bg-gradient-to-r from-primary to-transparent" />
          <p className="text-sm text-muted-foreground mt-4">
            Multiple traditional dasha calculation systems
          </p>
        </div>

        <Tabs defaultValue="vimshottari" className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="vimshottari">Vimshottari</TabsTrigger>
            <TabsTrigger value="yogini">Yogini</TabsTrigger>
            <TabsTrigger value="ashtottari" disabled={!allDashaSystems.ashtottari}>
              Ashtottari
            </TabsTrigger>
            <TabsTrigger value="chara">Chara</TabsTrigger>
            <TabsTrigger value="kalachakra">Kalachakra</TabsTrigger>
          </TabsList>

          {/* Vimshottari Dasha */}
          <TabsContent value="vimshottari" className="mt-6">
            <VimshottariDashaDisplay dashaSystem={allDashaSystems.vimshottari} />
          </TabsContent>

          {/* Yogini Dasha */}
          <TabsContent value="yogini" className="mt-6">
            <YoginiDashaDisplay dashaSystem={allDashaSystems.yogini} />
          </TabsContent>

          {/* Ashtottari Dasha */}
          <TabsContent value="ashtottari" className="mt-6">
            {allDashaSystems.ashtottari ? (
              <AshtottariDashaDisplay dashaSystem={allDashaSystems.ashtottari} />
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                Ashtottari Dasha is not applicable for this birth chart
              </div>
            )}
          </TabsContent>

          {/* Chara Dasha */}
          <TabsContent value="chara" className="mt-6">
            <CharaDashaDisplay dashaSystem={allDashaSystems.chara} />
          </TabsContent>

          {/* Kalachakra Dasha */}
          <TabsContent value="kalachakra" className="mt-6">
            {allDashaSystems.kalachakra ? (
              <KalachakraDashaDisplay dashaSystem={allDashaSystems.kalachakra} />
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                Kalachakra Dasha calculation in progress
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}

// Helper function to safely get Date object
function toDate(date: Date | string): Date {
  return date instanceof Date ? date : new Date(date);
}

// Helper function to safely compare dates
function areSameDates(date1: Date | string | undefined, date2: Date | string): boolean {
  if (!date1) return false;
  return toDate(date1).getTime() === toDate(date2).getTime();
}

// Vimshottari Dasha Display
function VimshottariDashaDisplay({ dashaSystem }: { dashaSystem: DashaSystem }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          The 120-year cycle divided among the nine planets
        </p>
      </div>

      {/* Current Dasha */}
      {dashaSystem.currentMahadasha && dashaSystem.currentAntardasha && 
       dashaSystem.currentMahadasha.startDate && dashaSystem.currentMahadasha.endDate && (
        <div className="p-6 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Current Period</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mahadasha:</span>
              <Badge className="bg-primary text-primary-foreground">
                {dashaSystem.currentMahadasha.planet}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Antardasha:</span>
              <Badge variant="outline">{dashaSystem.currentAntardasha.planet}</Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>
                {toDate(dashaSystem.currentMahadasha.startDate).toLocaleDateString()} -{" "}
                {toDate(dashaSystem.currentMahadasha.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Mahadasha Periods
        </h3>
        <div className="space-y-3">
          {dashaSystem.mahadashas.slice(0, 9).map((mahadasha, index) => (
            <PlanetDashaPeriodCard
              key={index}
              planet={mahadasha.planet}
              startDate={mahadasha.startDate}
              endDate={mahadasha.endDate}
              durationYears={mahadasha.durationYears}
              isCurrent={dashaSystem.currentMahadasha?.planet === mahadasha.planet &&
                        areSameDates(dashaSystem.currentMahadasha?.startDate, mahadasha.startDate)}
            />
          ))}
        </div>
      </div>

      {/* Birth Dasha Info */}
      <div className="p-4 rounded-md bg-muted/30 border border-border">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Birth Dasha:</span>{" "}
          {dashaSystem.birthDasha} with {dashaSystem.birthDashaBalance.toFixed(2)} years
          remaining
        </p>
      </div>
    </div>
  );
}

// Yogini Dasha Display
function YoginiDashaDisplay({ dashaSystem }: { dashaSystem: YoginiDashaSystem }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          The 36-year cycle divided among the eight Yoginis
        </p>
      </div>

      {/* Current Mahadasha */}
      {dashaSystem.currentMahadasha && 
       dashaSystem.currentMahadasha.startDate && dashaSystem.currentMahadasha.endDate && (
        <div className="p-6 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Current Period</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Yogini:</span>
              <Badge className="bg-primary text-primary-foreground">
                {dashaSystem.currentMahadasha.yogini}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Planet:</span>
              <Badge variant="outline">{dashaSystem.currentMahadasha.planet}</Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>
                {toDate(dashaSystem.currentMahadasha.startDate).toLocaleDateString()} -{" "}
                {toDate(dashaSystem.currentMahadasha.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Yogini Periods
        </h3>
        <div className="space-y-3">
          {dashaSystem.mahadashas.slice(0, 16).map((mahadasha, index) => (
            <YoginiDashaPeriodCard
              key={index}
              yogini={mahadasha.yogini}
              planet={mahadasha.planet}
              startDate={mahadasha.startDate}
              endDate={mahadasha.endDate}
              durationYears={mahadasha.durationYears}
              isCurrent={dashaSystem.currentMahadasha?.yogini === mahadasha.yogini && 
                        areSameDates(dashaSystem.currentMahadasha?.startDate, mahadasha.startDate)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Ashtottari Dasha Display
function AshtottariDashaDisplay({ dashaSystem }: { dashaSystem: AshtottariDashaSystem }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          The 108-year cycle divided among eight planets (excludes Ketu)
        </p>
      </div>

      {/* Current Mahadasha */}
      {dashaSystem.currentMahadasha && 
       dashaSystem.currentMahadasha.startDate && dashaSystem.currentMahadasha.endDate && (
        <div className="p-6 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Current Period</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mahadasha:</span>
              <Badge className="bg-primary text-primary-foreground">
                {dashaSystem.currentMahadasha.planet}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>
                {toDate(dashaSystem.currentMahadasha.startDate).toLocaleDateString()} -{" "}
                {toDate(dashaSystem.currentMahadasha.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Mahadasha Periods
        </h3>
        <div className="space-y-3">
          {dashaSystem.mahadashas.slice(0, 16).map((mahadasha, index) => (
            <PlanetDashaPeriodCard
              key={index}
              planet={mahadasha.planet}
              startDate={mahadasha.startDate}
              endDate={mahadasha.endDate}
              durationYears={mahadasha.durationYears}
              isCurrent={dashaSystem.currentMahadasha?.planet === mahadasha.planet &&
                        areSameDates(dashaSystem.currentMahadasha?.startDate, mahadasha.startDate)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Chara Dasha Display
function CharaDashaDisplay({ dashaSystem }: { dashaSystem: CharaDashaSystem }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Sign-based Jaimini dasha with variable durations (1-12 years)
        </p>
      </div>

      {/* Current Mahadasha */}
      {dashaSystem.currentMahadasha && 
       dashaSystem.currentMahadasha.startDate && dashaSystem.currentMahadasha.endDate && (
        <div className="p-6 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Current Period</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sign:</span>
              <Badge className="bg-primary text-primary-foreground">
                {dashaSystem.currentMahadasha.sign}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>
                {toDate(dashaSystem.currentMahadasha.startDate).toLocaleDateString()} -{" "}
                {toDate(dashaSystem.currentMahadasha.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Sign Periods
        </h3>
        <div className="space-y-3">
          {dashaSystem.mahadashas.slice(0, 12).map((mahadasha, index) => (
            <SignDashaPeriodCard
              key={index}
              sign={mahadasha.sign}
              startDate={mahadasha.startDate}
              endDate={mahadasha.endDate}
              durationYears={mahadasha.durationYears}
              isCurrent={dashaSystem.currentMahadasha?.sign === mahadasha.sign &&
                        areSameDates(dashaSystem.currentMahadasha?.startDate, mahadasha.startDate)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Kalachakra Dasha Display
function KalachakraDashaDisplay({ dashaSystem }: { dashaSystem: KalachakraDashaSystem }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Sign-based system with variable durations (4-21 years) based on Moon's nakshatra
        </p>
      </div>

      {/* Current Mahadasha */}
      {dashaSystem.currentMahadasha && 
       dashaSystem.currentMahadasha.startDate && dashaSystem.currentMahadasha.endDate && (
        <div className="p-6 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Current Period</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sign:</span>
              <Badge className="bg-primary text-primary-foreground">
                {dashaSystem.currentMahadasha.sign}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>
                {toDate(dashaSystem.currentMahadasha.startDate).toLocaleDateString()} -{" "}
                {toDate(dashaSystem.currentMahadasha.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Sign Periods
        </h3>
        <div className="space-y-3">
          {dashaSystem.mahadashas.slice(0, 12).map((mahadasha, index) => (
            <SignDashaPeriodCard
              key={index}
              sign={mahadasha.sign}
              startDate={mahadasha.startDate}
              endDate={mahadasha.endDate}
              durationYears={mahadasha.durationYears}
              isCurrent={dashaSystem.currentMahadasha?.sign === mahadasha.sign &&
                        areSameDates(dashaSystem.currentMahadasha?.startDate, mahadasha.startDate)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper components for period cards
function PlanetDashaPeriodCard({
  planet,
  startDate,
  endDate,
  durationYears,
  isCurrent,
}: {
  planet: DashaPlanet;
  startDate: Date;
  endDate: Date;
  durationYears: number;
  isCurrent: boolean;
}) {
  const getPlanetColor = (p: DashaPlanet): string => {
    const colors: Record<DashaPlanet, string> = {
      [DashaPlanet.Sun]: "bg-chart-4",
      [DashaPlanet.Moon]: "bg-chart-1",
      [DashaPlanet.Mars]: "bg-destructive",
      [DashaPlanet.Mercury]: "bg-chart-3",
      [DashaPlanet.Jupiter]: "bg-primary",
      [DashaPlanet.Venus]: "bg-chart-2",
      [DashaPlanet.Saturn]: "bg-chart-5",
      [DashaPlanet.Rahu]: "bg-secondary",
      [DashaPlanet.Ketu]: "bg-muted",
    };
    return colors[p] || "bg-muted";
  };

  return (
    <div
      className={`relative p-4 rounded-md border ${
        isCurrent ? "bg-primary/5 border-primary/50" : "bg-muted/10 border-border"
      } transition-all`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md" style={{
        background: `hsl(var(--${getPlanetColor(planet).replace('bg-', '')}))`
      }} />
      <div className="pl-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge className={isCurrent ? "bg-primary" : "bg-muted"}>{planet}</Badge>
            {isCurrent && (
              <Badge variant="outline" className="text-xs">Current</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{toDate(startDate).toLocaleDateString()}</span>
            <span>→</span>
            <span>{toDate(endDate).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{durationYears} years</p>
        </div>
      </div>
    </div>
  );
}

function YoginiDashaPeriodCard({
  yogini,
  planet,
  startDate,
  endDate,
  durationYears,
  isCurrent,
}: {
  yogini: string;
  planet: DashaPlanet;
  startDate: Date;
  endDate: Date;
  durationYears: number;
  isCurrent: boolean;
}) {
  return (
    <div
      className={`relative p-4 rounded-md border ${
        isCurrent ? "bg-primary/5 border-primary/50" : "bg-muted/10 border-border"
      } transition-all`}
    >
      <div className="pl-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge className={isCurrent ? "bg-primary" : "bg-muted"}>{yogini}</Badge>
            <Badge variant="outline" className="text-xs">{planet}</Badge>
            {isCurrent && (
              <Badge variant="outline" className="text-xs">Current</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{toDate(startDate).toLocaleDateString()}</span>
            <span>→</span>
            <span>{toDate(endDate).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{durationYears} years</p>
        </div>
      </div>
    </div>
  );
}

function SignDashaPeriodCard({
  sign,
  startDate,
  endDate,
  durationYears,
  isCurrent,
}: {
  sign: string;
  startDate: Date;
  endDate: Date;
  durationYears: number;
  isCurrent: boolean;
}) {
  return (
    <div
      className={`relative p-4 rounded-md border ${
        isCurrent ? "bg-primary/5 border-primary/50" : "bg-muted/10 border-border"
      } transition-all`}
    >
      <div className="pl-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge className={isCurrent ? "bg-primary" : "bg-muted"}>{sign}</Badge>
            {isCurrent && (
              <Badge variant="outline" className="text-xs">Current</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{toDate(startDate).toLocaleDateString()}</span>
            <span>→</span>
            <span>{toDate(endDate).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{durationYears} years</p>
        </div>
      </div>
    </div>
  );
}
