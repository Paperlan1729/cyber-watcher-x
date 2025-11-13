import { useState } from "react";
import { Shield } from "lucide-react";
import { Dashboard } from "@/components/Dashboard";
import { LogAnalyzer } from "@/components/LogAnalyzer";
import { ThreatList } from "@/components/ThreatList";
import { detectThreats, Threat } from "@/components/ThreatDetector";

const Index = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [logsCount, setLogsCount] = useState(0);

  const handleAnalyzeLogs = (logs: string[]) => {
    const detectedThreats = detectThreats(logs);
    setThreats(prev => [...detectedThreats, ...prev]);
    setLogsCount(prev => prev + logs.length);
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

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Log Analyzer */}
            <LogAnalyzer onAnalyze={handleAnalyzeLogs} />

            {/* Threat List */}
            <ThreatList threats={threats} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
