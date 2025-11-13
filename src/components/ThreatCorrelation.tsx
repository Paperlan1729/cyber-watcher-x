import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, AlertTriangle } from "lucide-react";
import { ThreatCorrelation } from "./ThreatDetector";

interface ThreatCorrelationProps {
  correlations: ThreatCorrelation[];
}

export const ThreatCorrelationView = ({ correlations }: ThreatCorrelationProps) => {
  if (correlations.length === 0) {
    return null;
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-warning" />
          <CardTitle className="text-foreground">Correlated Attack Patterns</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {correlations.map((correlation, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-warning/20 bg-warning/5 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
                    <span className="font-semibold text-sm text-foreground">
                      {correlation.campaign}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Technique: {correlation.technique}
                  </p>
                </div>
                <Badge className="bg-warning text-warning-foreground">
                  {correlation.count} related threats
                </Badge>
              </div>
              <div className="pt-2 border-t border-warning/10">
                <p className="text-xs text-muted-foreground">
                  Multiple threats detected using the same attack technique. This may indicate a coordinated attack campaign.
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
