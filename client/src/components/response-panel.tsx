import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface ResponsePanelProps {
  title: string;
  content: string;
  data?: any;
  type: "greeting" | "response";
}

export function ResponsePanel({ title, content, data, type }: ResponsePanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDetailedChart, setShowDetailedChart] = useState(false);

  return (
    <div className="group animate-fade-in">
      {/* Main Response Panel */}
      <div className="relative bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-xl border border-primary/20 rounded-xl overflow-hidden shadow-xl shadow-primary/5">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/3 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div
            className="flex items-center justify-between p-5 border-b border-primary/10 cursor-pointer hover:bg-primary/5 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-foreground">
                {title}
              </h3>
            </div>

            <Button variant="ghost" size="icon" className="shrink-0">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Body */}
          {isExpanded && (
            <div className="p-6 space-y-4">
              {/* Main Content with Markdown Support */}
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="text-foreground/90 leading-relaxed space-y-3">
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => (
                        <h2 className="text-xl font-semibold text-primary mt-6 mb-3 first:mt-0">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-foreground/80 leading-relaxed mb-3">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-primary font-semibold">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="text-muted-foreground italic">
                          {children}
                        </em>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-1 text-foreground/80">
                          {children}
                        </ul>
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Deep Dive Options */}
              {data && type === "response" && (
                <div className="pt-4 border-t border-primary/10">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDetailedChart(!showDetailedChart)}
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {showDetailedChart ? "Hide" : "View"} Detailed Chart
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Planetary Strengths
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Remedial Measures
                    </Button>
                  </div>

                  {/* Detailed Chart Section */}
                  {showDetailedChart && data.planetaryPositions && (
                    <div className="mt-4 p-4 bg-background/50 rounded-lg border border-primary/10">
                      <h4 className="text-sm font-semibold text-primary mb-3">
                        Planetary Positions Table
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-primary/20">
                              <th className="text-left py-2 text-muted-foreground">Planet</th>
                              <th className="text-left py-2 text-muted-foreground">Sign</th>
                              <th className="text-left py-2 text-muted-foreground">Degree</th>
                              <th className="text-left py-2 text-muted-foreground">House</th>
                              <th className="text-left py-2 text-muted-foreground">Nakshatra</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(data.planetaryPositions).map(([planet, pos]: [string, any]) => (
                              <tr key={planet} className="border-b border-primary/10">
                                <td className="py-2 font-medium text-foreground">{planet}</td>
                                <td className="py-2 text-foreground/80">{pos.sign}</td>
                                <td className="py-2 text-foreground/80">{pos.degree.toFixed(2)}°</td>
                                <td className="py-2 text-foreground/80">{pos.house}</td>
                                <td className="py-2 text-foreground/80">{pos.nakshatra?.name || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
