import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, File, FileJson, Calendar, Shield, Activity } from "lucide-react";
import { toast } from "sonner";
import type { Threat } from "@/components/ThreatDetector";
import type { Agent } from "@/components/AgentManager";

interface ReportGeneratorProps {
  threats: Threat[];
  agents?: Agent[];
}

export const ReportGenerator = ({ threats, agents = [] }: ReportGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = (format: "pdf" | "html" | "json") => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      const report = {
        metadata: {
          generated_at: new Date().toISOString(),
          report_id: `IR-${Date.now()}`,
          analyst: "SOC Analyst",
          classification: "CONFIDENTIAL"
        },
        executive_summary: {
          total_threats: threats.length,
          critical_threats: threats.filter(t => t.severity === "critical").length,
          affected_devices: agents.filter(a => a.threatsDetected > 0).length,
          total_agents: agents.length,
          isolated_devices: agents.filter(a => a.status === "isolated").length,
          investigation_status: "ACTIVE"
        },
        timeline: threats.map(t => ({
          timestamp: t.timestamp,
          severity: t.severity,
          type: t.type,
          description: t.description,
          logEntry: t.logEntry
        })),
        affected_systems: agents.filter(a => a.threatsDetected > 0).map(a => ({
          hostname: a.hostname,
          ipv4: a.ipv4,
          os: a.os,
          threats_detected: a.threatsDetected,
          health_score: a.healthScore,
          status: a.status
        })),
        indicators_of_compromise: {
          malicious_ips: ["203.0.113.45", "198.51.100.23"],
          suspicious_processes: ["powershell.exe", "cmd.exe", "wmic.exe"],
          file_hashes: [
            "44d88612fea8a8f36de82e1278abb02f",
            "e99a18c428cb38d5f260853678922e03"
          ],
          domains: ["malicious-c2.example.com", "phishing-site.example.net"]
        },
        network_activity: {
          c2_communications: threats.filter(t => t.technique?.includes("Command and Control")).length,
          lateral_movement: threats.filter(t => t.technique?.includes("Lateral Movement")).length,
          data_exfiltration: threats.filter(t => t.technique?.includes("Exfiltration")).length
        },
        mitigation_actions: {
          devices_isolated: agents.filter(a => a.status === "isolated").length,
          processes_terminated: 12,
          accounts_disabled: 3,
          firewall_rules_added: 8,
          evidence_collected: true
        },
        recommendations: [
          "Continue monitoring isolated devices for 24-48 hours",
          "Conduct full forensic analysis on WEB-SERVER-01",
          "Review and update firewall rules for subnet 192.168.20.0/24",
          "Implement enhanced logging for PowerShell execution",
          "Schedule security awareness training for affected users"
        ],
        chain_of_custody: [
          {
            timestamp: new Date().toISOString(),
            action: "Evidence Collection Initiated",
            analyst: "SOC Analyst",
            details: "Memory dumps and disk images collected from isolated devices"
          },
          {
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            action: "Device Isolation",
            analyst: "SOC Analyst",
            details: "WEB-SERVER-01 isolated from network"
          },
          {
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            action: "Threat Detection",
            analyst: "SIEM System",
            details: "Multiple malware indicators detected via log correlation"
          }
        ]
      };

      // Create downloadable blob
      let blob: Blob;
      let filename: string;

      if (format === "json") {
        blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
        filename = `incident-report-${report.metadata.report_id}.json`;
      } else if (format === "html") {
        const html = generateHTML(report);
        blob = new Blob([html], { type: "text/html" });
        filename = `incident-report-${report.metadata.report_id}.html`;
      } else {
        // PDF would require a library, so we'll simulate it
        const pdfContent = `INCIDENT RESPONSE REPORT\n\nReport ID: ${report.metadata.report_id}\nGenerated: ${report.metadata.generated_at}\n\nThis is a simulated PDF. In production, use a PDF generation library.`;
        blob = new Blob([pdfContent], { type: "application/pdf" });
        filename = `incident-report-${report.metadata.report_id}.pdf`;
      }

      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsGenerating(false);
      toast.success(`Report generated: ${filename}`);
    }, 2000);
  };

  const generateHTML = (report: any) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Incident Response Report - ${report.metadata.report_id}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; color: #1e40af; }
    .classification { background: #dc2626; color: white; padding: 5px 15px; display: inline-block; border-radius: 4px; font-weight: bold; }
    .section { margin: 30px 0; }
    .section h2 { color: #1e40af; border-left: 4px solid #2563eb; padding-left: 15px; }
    .metric { display: inline-block; margin: 15px 20px 15px 0; }
    .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .metric-value { font-size: 32px; font-weight: bold; color: #1e40af; }
    .timeline-item { padding: 15px; border-left: 3px solid #2563eb; margin-left: 20px; margin-bottom: 15px; background: #f9fafb; }
    .severity { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
    .severity-critical { background: #fee2e2; color: #dc2626; }
    .severity-warning { background: #fef3c7; color: #d97706; }
    .ioc { font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 3px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: bold; color: #374151; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛡️ INCIDENT RESPONSE REPORT</h1>
      <p><strong>Report ID:</strong> ${report.metadata.report_id}</p>
      <p><strong>Generated:</strong> ${new Date(report.metadata.generated_at).toLocaleString()}</p>
      <p><strong>Analyst:</strong> ${report.metadata.analyst}</p>
      <span class="classification">${report.metadata.classification}</span>
    </div>

    <div class="section">
      <h2>📊 Executive Summary</h2>
      <div class="metric">
        <div class="metric-label">Total Threats</div>
        <div class="metric-value">${report.executive_summary.total_threats}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Critical</div>
        <div class="metric-value" style="color: #dc2626;">${report.executive_summary.critical_threats}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Affected Devices</div>
        <div class="metric-value">${report.executive_summary.affected_devices}/${report.executive_summary.total_agents}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Isolated</div>
        <div class="metric-value" style="color: #dc2626;">${report.executive_summary.isolated_devices}</div>
      </div>
    </div>

    <div class="section">
      <h2>⏱️ Attack Timeline</h2>
      ${report.timeline.map((t: any) => `
        <div class="timeline-item">
          <span class="severity severity-${t.severity}">${t.severity.toUpperCase()}</span>
          <strong>${t.type}</strong> - ${new Date(t.timestamp).toLocaleString()}<br>
          <small>${t.description}</small>
        </div>
      `).join('')}
    </div>

    <div class="section">
      <h2>💻 Affected Systems</h2>
      <table>
        <tr>
          <th>Hostname</th>
          <th>IPv4 Address</th>
          <th>OS</th>
          <th>Threats</th>
          <th>Health</th>
          <th>Status</th>
        </tr>
        ${report.affected_systems.map((sys: any) => `
          <tr>
            <td><strong>${sys.hostname}</strong></td>
            <td><span class="ioc">${sys.ipv4}</span></td>
            <td>${sys.os}</td>
            <td>${sys.threats_detected}</td>
            <td>${sys.health_score}%</td>
            <td><span class="severity severity-${sys.status === 'isolated' ? 'critical' : 'warning'}">${sys.status.toUpperCase()}</span></td>
          </tr>
        `).join('')}
      </table>
    </div>

    <div class="section">
      <h2>🎯 Indicators of Compromise (IOCs)</h2>
      <p><strong>Malicious IPs:</strong></p>
      <ul>${report.indicators_of_compromise.malicious_ips.map((ip: string) => `<li><span class="ioc">${ip}</span></li>`).join('')}</ul>
      
      <p><strong>File Hashes (MD5):</strong></p>
      <ul>${report.indicators_of_compromise.file_hashes.map((hash: string) => `<li><span class="ioc">${hash}</span></li>`).join('')}</ul>
      
      <p><strong>Suspicious Processes:</strong></p>
      <ul>${report.indicators_of_compromise.suspicious_processes.map((proc: string) => `<li><span class="ioc">${proc}</span></li>`).join('')}</ul>
    </div>

    <div class="section">
      <h2>🔧 Mitigation Actions Taken</h2>
      <ul>
        <li>Devices Isolated: <strong>${report.mitigation_actions.devices_isolated}</strong></li>
        <li>Processes Terminated: <strong>${report.mitigation_actions.processes_terminated}</strong></li>
        <li>Accounts Disabled: <strong>${report.mitigation_actions.accounts_disabled}</strong></li>
        <li>Firewall Rules Added: <strong>${report.mitigation_actions.firewall_rules_added}</strong></li>
        <li>Evidence Collected: <strong>${report.mitigation_actions.evidence_collected ? 'YES' : 'NO'}</strong></li>
      </ul>
    </div>

    <div class="section">
      <h2>📋 Recommendations</h2>
      <ol>
        ${report.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
      </ol>
    </div>

    <div class="section">
      <h2>🔐 Chain of Custody</h2>
      ${report.chain_of_custody.map((entry: any) => `
        <div class="timeline-item">
          <strong>${entry.action}</strong> - ${new Date(entry.timestamp).toLocaleString()}<br>
          <small>By: ${entry.analyst} | ${entry.details}</small>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>
    `;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Report Generator</h2>
          <p className="text-sm text-muted-foreground">Generate comprehensive incident response reports</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Report Preview */}
        <div className="border border-border rounded-lg p-4 bg-muted/50">
          <h3 className="font-semibold text-foreground mb-4">Report Contents</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-foreground">Executive Summary</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-foreground">Attack Timeline</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-foreground">Threat Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-foreground">IOC List</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-foreground">Network Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-foreground">Mitigation Actions</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-foreground">Affected Systems</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-foreground">Recommendations</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-foreground">Chain of Custody</span>
            </div>
          </div>
        </div>

        {/* Current Data Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-primary">{threats.length}</p>
            <p className="text-sm text-muted-foreground">Total Threats</p>
          </div>
          <div className="border border-border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-primary">{agents.length}</p>
            <p className="text-sm text-muted-foreground">Monitored Agents</p>
          </div>
          <div className="border border-border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-red-500">
              {agents.filter(a => a.status === "isolated").length}
            </p>
            <p className="text-sm text-muted-foreground">Isolated Devices</p>
          </div>
        </div>

        {/* Download Options */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Download Report</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={() => generateReport("pdf")}
              disabled={isGenerating}
              className="w-full"
              variant="outline"
            >
              <File className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              onClick={() => generateReport("html")}
              disabled={isGenerating}
              className="w-full"
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download HTML
            </Button>
            <Button
              onClick={() => generateReport("json")}
              disabled={isGenerating}
              className="w-full"
              variant="outline"
            >
              <FileJson className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </div>
        </div>

        {isGenerating && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground mt-2">Generating report...</p>
          </div>
        )}
      </div>
    </Card>
  );
};
