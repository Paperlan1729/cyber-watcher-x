import { useState, useMemo, lazy, Suspense } from "react";
import { Shield, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dashboard } from "@/components/Dashboard";
import { LogAnalyzer } from "@/components/LogAnalyzer";
import { ThreatList } from "@/components/ThreatList";
import { AgentManager } from "@/components/AgentManager";
import { detectThreats, correlatThreats, Threat } from "@/components/ThreatDetector";
import { toast } from "sonner";

// Lazy load below-the-fold components
const ThreatCorrelationView = lazy(() => import("@/components/ThreatCorrelation").then(m => ({ default: m.ThreatCorrelationView })));
const IncidentPlaybook = lazy(() => import("@/components/IncidentPlaybook").then(m => ({ default: m.IncidentPlaybook })));
const AutomatedWorkflow = lazy(() => import("@/components/AutomatedWorkflow").then(m => ({ default: m.AutomatedWorkflow })));
const AlertConfiguration = lazy(() => import("@/components/AlertConfiguration").then(m => ({ default: m.AlertConfiguration })));
const ReportGenerator = lazy(() => import("@/components/ReportGenerator").then(m => ({ default: m.ReportGenerator })));
const ArchitectureDocumentation = lazy(() => import("@/components/ArchitectureDocumentation").then(m => ({ default: m.ArchitectureDocumentation })));

const Index = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [logsCount, setLogsCount] = useState(0);

  const correlations = useMemo(() => correlatThreats(threats), [threats]);
  const correlatedThreatIds = useMemo(
    () => correlations.flatMap(c => c.threatIds),
    [correlations]
  );

  const handleAnalyzeLogs = (logs: string[]) => {
    console.log("Analyzing logs:", logs);
    const detectedThreats = detectThreats(logs);
    console.log("Detected threats:", detectedThreats);
    setThreats(prev => [...detectedThreats, ...prev]);
    setLogsCount(prev => prev + logs.length);
  };

  const handleIsolateAgent = (agentId: string) => {
    toast.success(`Isolation command sent to ${agentId}`, {
      description: "Device will be quarantined from network within 30 seconds"
    });
  };

  const handleUnIsolateAgent = (agentId: string) => {
    toast.success(`Device ${agentId} restored to network`, {
      description: "Agent connectivity re-established"
    });
  };

  const handleCollectEvidence = (agentId: string) => {
    toast.success(`Evidence collection initiated for ${agentId}`, {
      description: "Memory snapshot and logs being collected"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">CyberGuard SIEM</h1>
              <p className="text-sm text-muted-foreground">Advanced Malware Detection & Log Analysis</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Dashboard Overview */}
          <Dashboard threats={threats} logsCount={logsCount} />

          {/* Agent Manager - Multi-Device Monitoring */}
          <AgentManager 
            onIsolateAgent={handleIsolateAgent}
            onUnIsolateAgent={handleUnIsolateAgent}
            onCollectEvidence={handleCollectEvidence}
          />

          {/* Architecture Documentation */}
          <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-lg" />}>
            <ArchitectureDocumentation />
          </Suspense>

          {/* Automated Workflow Pipeline */}
          <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-lg" />}>
            <AutomatedWorkflow correlations={correlations} />
          </Suspense>

          {/* Threat Correlation */}
          <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-lg" />}>
            <ThreatCorrelationView correlations={correlations} />
          </Suspense>

          {/* Incident Response Playbooks */}
          <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-lg" />}>
            <IncidentPlaybook correlations={correlations} />
          </Suspense>

          {/* Alert Configuration */}
          <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-lg" />}>
            <AlertConfiguration />
          </Suspense>

          {/* Report Generator */}
          <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded-lg" />}>
            <ReportGenerator threats={threats} />
          </Suspense>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Log Analyzer */}
            <LogAnalyzer onAnalyze={handleAnalyzeLogs} />

            {/* Threat List */}
            <ThreatList threats={threats} correlatedThreatIds={correlatedThreatIds} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
