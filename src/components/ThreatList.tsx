import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, AlertCircle, ShieldCheck } from "lucide-react";
import { Threat } from "./ThreatDetector";

interface ThreatListProps {
  threats: Threat[];
}

export const ThreatList = ({ threats }: ThreatListProps) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: "bg-destructive text-destructive-foreground",
      warning: "bg-warning text-warning-foreground",
      info: "bg-primary text-primary-foreground"
    };
    return variants[severity as keyof typeof variants] || variants.info;
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Detected Threats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {threats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No threats detected. Analyze logs to see results.
            </p>
          ) : (
            threats.map((threat) => (
              <div
                key={threat.id}
                className="p-4 rounded-lg border border-border bg-secondary/50 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(threat.severity)}
                    <span className="font-semibold text-sm text-foreground">{threat.type}</span>
                  </div>
                  <Badge className={getSeverityBadge(threat.severity)}>
                    {threat.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{threat.description}</p>
                <div className="mt-2 p-2 bg-background rounded border border-border">
                  <code className="text-xs font-mono text-foreground break-all">
                    {threat.logEntry}
                  </code>
                </div>
                <div className="mt-3 p-3 bg-primary/5 rounded border border-primary/20">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-primary mb-1">Mitigation Steps</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {threat.mitigation}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(threat.timestamp).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
