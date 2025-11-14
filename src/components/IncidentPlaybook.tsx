import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scroll, CheckCircle2 } from "lucide-react";
import { ThreatCorrelation } from "./ThreatDetector";

interface PlaybookStep {
  priority: "immediate" | "high" | "medium";
  action: string;
}

interface Playbook {
  campaign: string;
  severity: "critical" | "high" | "medium";
  steps: PlaybookStep[];
}

const INCIDENT_PLAYBOOKS: Record<string, Playbook> = {
  "APT Campaign": {
    campaign: "APT Campaign",
    severity: "critical",
    steps: [
      { priority: "immediate", action: "Isolate affected systems from network immediately" },
      { priority: "immediate", action: "Preserve all system memory dumps and disk images for forensics" },
      { priority: "immediate", action: "Reset all credentials on affected systems and connected accounts" },
      { priority: "high", action: "Review all network traffic logs for lateral movement indicators" },
      { priority: "high", action: "Check for persistence mechanisms (scheduled tasks, registry keys, services)" },
      { priority: "high", action: "Scan entire network for IoCs related to detected techniques" },
      { priority: "medium", action: "Notify security team and management of potential APT activity" },
      { priority: "medium", action: "Engage incident response team and consider third-party forensics support" },
      { priority: "medium", action: "Document all findings and create incident timeline" },
    ],
  },
  "Web Attack": {
    campaign: "Web Attack",
    severity: "high",
    steps: [
      { priority: "immediate", action: "Take affected web server offline or block malicious IPs at firewall" },
      { priority: "immediate", action: "Kill any suspicious command processes spawned by web server" },
      { priority: "high", action: "Scan web directories for webshells and backdoors" },
      { priority: "high", action: "Review web server access logs for injection attempts and suspicious requests" },
      { priority: "high", action: "Patch vulnerable web applications immediately" },
      { priority: "medium", action: "Implement WAF rules to block similar attack patterns" },
      { priority: "medium", action: "Review and strengthen input validation in web applications" },
      { priority: "medium", action: "Enable enhanced logging and monitoring for web servers" },
    ],
  },
  "Phishing": {
    campaign: "Phishing",
    severity: "high",
    steps: [
      { priority: "immediate", action: "Block malicious URLs/domains at proxy and firewall" },
      { priority: "immediate", action: "Terminate suspicious browser processes" },
      { priority: "immediate", action: "Scan affected systems for malware" },
      { priority: "high", action: "Reset credentials for users who may have entered passwords" },
      { priority: "high", action: "Review email logs for similar phishing attempts" },
      { priority: "high", action: "Add indicators to email security gateway blocklist" },
      { priority: "medium", action: "Send security awareness alert to all users about the phishing campaign" },
      { priority: "medium", action: "Conduct phishing simulation training" },
    ],
  },
  "Insider Threat": {
    campaign: "Insider Threat",
    severity: "high",
    steps: [
      { priority: "immediate", action: "Disable suspicious user accounts pending investigation" },
      { priority: "immediate", action: "Review and remove unauthorized user accounts created" },
      { priority: "high", action: "Audit all recent privilege escalations and group membership changes" },
      { priority: "high", action: "Review user's recent file access and data exfiltration attempts" },
      { priority: "high", action: "Check for unauthorized remote access or VPN connections" },
      { priority: "medium", action: "Interview user and supervisor if appropriate" },
      { priority: "medium", action: "Enable enhanced user activity monitoring" },
      { priority: "medium", action: "Review and strengthen access control policies" },
    ],
  },
};

interface IncidentPlaybookProps {
  correlations: ThreatCorrelation[];
}

export const IncidentPlaybook = ({ correlations }: IncidentPlaybookProps) => {
  const activePlaybooks = correlations
    .filter(corr => corr.campaign && INCIDENT_PLAYBOOKS[corr.campaign])
    .map(corr => INCIDENT_PLAYBOOKS[corr.campaign!])
    .filter((playbook, index, self) => 
      index === self.findIndex(p => p.campaign === playbook.campaign)
    );

  if (activePlaybooks.length === 0) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "immediate": return "text-destructive";
      case "high": return "text-warning";
      case "medium": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "default";
      default: return "secondary";
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Scroll className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">Incident Response Playbooks</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {activePlaybooks.map((playbook, index) => (
          <div key={index} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{playbook.campaign}</h3>
              <Badge variant={getSeverityVariant(playbook.severity)}>
                {playbook.severity.toUpperCase()} SEVERITY
              </Badge>
            </div>
            
            <div className="space-y-2">
              {playbook.steps.map((step, stepIndex) => (
                <div
                  key={stepIndex}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors"
                >
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(step.priority)}`}
                      >
                        {step.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{step.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
