import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, Webhook, AlertTriangle, Shield, Info } from "lucide-react";
import { toast } from "sonner";

interface AlertChannel {
  id: string;
  name: string;
  type: "email" | "slack" | "teams" | "webhook";
  enabled: boolean;
  icon: any;
  endpoint?: string;
}

interface AlertRule {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  name: string;
  description: string;
  enabled: boolean;
  escalateToL2: boolean;
  escalateToL3: boolean;
  channels: string[];
}

export const AlertConfiguration = () => {
  const [channels, setChannels] = useState<AlertChannel[]>([
    { id: "email", name: "Email", type: "email", enabled: true, icon: Mail, endpoint: "soc@company.com" },
    { id: "slack", name: "Slack", type: "slack", enabled: true, icon: MessageSquare, endpoint: "#security-alerts" },
    { id: "teams", name: "Microsoft Teams", type: "teams", enabled: false, icon: MessageSquare, endpoint: "SOC Channel" },
    { id: "webhook", name: "Custom Webhook", type: "webhook", enabled: false, icon: Webhook, endpoint: "https://api.company.com/alerts" }
  ]);

  const [rules, setRules] = useState<AlertRule[]>([
    {
      id: "critical-1",
      severity: "critical",
      name: "Confirmed Malware Detection",
      description: "Active malware confirmed on endpoint with C2 communication",
      enabled: true,
      escalateToL2: true,
      escalateToL3: true,
      channels: ["email", "slack"]
    },
    {
      id: "critical-2",
      severity: "critical",
      name: "Lateral Movement Detected",
      description: "Suspicious lateral movement across multiple devices",
      enabled: true,
      escalateToL2: true,
      escalateToL3: false,
      channels: ["email", "slack"]
    },
    {
      id: "high-1",
      severity: "high",
      name: "Suspicious Process Execution",
      description: "Unknown process with malicious indicators detected",
      enabled: true,
      escalateToL2: true,
      escalateToL3: false,
      channels: ["slack"]
    },
    {
      id: "high-2",
      severity: "high",
      name: "Privilege Escalation Attempt",
      description: "User attempting to elevate privileges abnormally",
      enabled: true,
      escalateToL2: false,
      escalateToL3: false,
      channels: ["slack"]
    },
    {
      id: "medium-1",
      severity: "medium",
      name: "Policy Violation",
      description: "Security policy violation detected on endpoint",
      enabled: true,
      escalateToL2: false,
      escalateToL3: false,
      channels: ["slack"]
    },
    {
      id: "low-1",
      severity: "low",
      name: "Suspicious File Download",
      description: "File downloaded from untrusted source",
      enabled: false,
      escalateToL2: false,
      escalateToL3: false,
      channels: []
    },
    {
      id: "info-1",
      severity: "info",
      name: "Agent Heartbeat Lost",
      description: "Agent stopped sending heartbeat signals",
      enabled: true,
      escalateToL2: false,
      escalateToL3: false,
      channels: ["email"]
    }
  ]);

  const toggleChannel = (channelId: string) => {
    setChannels(prev => prev.map(c => 
      c.id === channelId ? { ...c, enabled: !c.enabled } : c
    ));
    toast.success("Alert channel updated");
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const toggleEscalation = (ruleId: string, level: "L2" | "L3") => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      return level === "L2" 
        ? { ...r, escalateToL2: !r.escalateToL2 }
        : { ...r, escalateToL3: !r.escalateToL3 };
    }));
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-500/10 text-red-500 border-red-500/20",
      high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      info: "bg-info/10 text-info border-info/20"
    };
    return colors[severity] || colors.info;
  };

  const testAlert = () => {
    const enabledChannels = channels.filter(c => c.enabled).map(c => c.name).join(", ");
    toast.success(`Test alert sent to: ${enabledChannels}`);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Alert Configuration</h2>
          <p className="text-sm text-muted-foreground">Configure alerting channels and escalation rules</p>
        </div>
      </div>

      {/* Alert Channels */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">Alert Channels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map(channel => {
            const Icon = channel.icon;
            return (
              <div key={channel.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-semibold text-foreground">{channel.name}</h4>
                      <p className="text-xs text-muted-foreground">{channel.endpoint}</p>
                    </div>
                  </div>
                  <Switch
                    checked={channel.enabled}
                    onCheckedChange={() => toggleChannel(channel.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <Button onClick={testAlert} variant="outline" className="mt-4">
          Send Test Alert
        </Button>
      </div>

      {/* Alert Rules */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Alert Rules by Severity</h3>
        <div className="space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={getSeverityColor(rule.severity)}>
                      {rule.severity.toUpperCase()}
                    </Badge>
                    <h4 className="font-semibold text-foreground">{rule.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </div>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => toggleRule(rule.id)}
                />
              </div>

              {rule.enabled && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.escalateToL2}
                        onCheckedChange={() => toggleEscalation(rule.id, "L2")}
                        disabled={!rule.enabled}
                      />
                      <span className="text-sm text-foreground">Escalate to L2</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.escalateToL3}
                        onCheckedChange={() => toggleEscalation(rule.id, "L3")}
                        disabled={!rule.enabled}
                      />
                      <span className="text-sm text-foreground">Escalate to L3</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Active Channels:</p>
                    <div className="flex flex-wrap gap-2">
                      {rule.channels.map(channelId => {
                        const channel = channels.find(c => c.id === channelId);
                        if (!channel || !channel.enabled) return null;
                        const Icon = channel.icon;
                        return (
                          <Badge key={channelId} variant="outline" className="gap-1">
                            <Icon className="h-3 w-3" />
                            {channel.name}
                          </Badge>
                        );
                      })}
                      {rule.channels.filter(cId => channels.find(c => c.id === cId)?.enabled).length === 0 && (
                        <span className="text-sm text-muted-foreground">No active channels</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
