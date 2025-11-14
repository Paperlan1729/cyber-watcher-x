import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch, Shield, Lock, Trash2, Bell, Database, Network, Monitor } from "lucide-react";
import { ThreatCorrelation } from "./ThreatDetector";

interface AutomatedWorkflowProps {
  correlations: ThreatCorrelation[];
}

export const AutomatedWorkflow = ({ correlations }: AutomatedWorkflowProps) => {
  const hasActiveThreats = correlations.length > 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">Automated Malware Response Pipeline</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detection">Detection</TabsTrigger>
            <TabsTrigger value="containment">Containment</TabsTrigger>
            <TabsTrigger value="eradication">Eradication</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Workflow State Diagram</h3>
              <div className="bg-background/50 border border-border rounded-lg p-6">
                <div className="flex flex-col gap-4">
                  <WorkflowStage 
                    icon={<Database className="h-5 w-5" />}
                    title="Log Ingestion"
                    status={hasActiveThreats ? "active" : "monitoring"}
                    description="Network telemetry, Windows events, EDR logs → SIEM"
                  />
                  <WorkflowArrow />
                  <WorkflowStage 
                    icon={<Shield className="h-5 w-5" />}
                    title="Detection & Correlation"
                    status={hasActiveThreats ? "alert" : "normal"}
                    description="Pattern matching, threat intelligence, behavioral analysis"
                  />
                  <WorkflowArrow />
                  <WorkflowStage 
                    icon={<Lock className="h-5 w-5" />}
                    title="Automated Containment"
                    status={hasActiveThreats ? "executing" : "standby"}
                    description="Endpoint isolation, network segmentation, account lockdown"
                  />
                  <WorkflowArrow />
                  <WorkflowStage 
                    icon={<Trash2 className="h-5 w-5" />}
                    title="Eradication"
                    status="standby"
                    description="Artifact removal, memory analysis, system restoration"
                  />
                  <WorkflowArrow />
                  <WorkflowStage 
                    icon={<Bell className="h-5 w-5" />}
                    title="Alerting & Reporting"
                    status={hasActiveThreats ? "notifying" : "standby"}
                    description="Email, Slack, SIEM dashboard, incident ticket creation"
                  />
                </div>
              </div>

              {hasActiveThreats && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                  <h4 className="font-semibold text-destructive mb-2">Active Threats Detected</h4>
                  <p className="text-sm text-foreground">
                    {correlations.length} correlated threat pattern(s) detected. 
                    Automated response workflow has been initiated.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="detection" className="space-y-4 mt-4">
            <DetectionPhase />
          </TabsContent>

          <TabsContent value="containment" className="space-y-4 mt-4">
            <ContainmentPhase />
          </TabsContent>

          <TabsContent value="eradication" className="space-y-4 mt-4">
            <EradicationPhase />
          </TabsContent>

          <TabsContent value="automation" className="space-y-4 mt-4">
            <AutomationPipeline />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const WorkflowStage = ({ icon, title, status, description }: {
  icon: React.ReactNode;
  title: string;
  status: string;
  description: string;
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "alert": return "text-destructive";
      case "active": return "text-primary";
      case "executing": return "text-warning";
      case "notifying": return "text-info";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "alert": return <Badge variant="destructive">ALERT</Badge>;
      case "active": return <Badge className="bg-primary">ACTIVE</Badge>;
      case "executing": return <Badge className="bg-warning text-warning-foreground">EXECUTING</Badge>;
      case "notifying": return <Badge className="bg-info text-info-foreground">NOTIFYING</Badge>;
      case "monitoring": return <Badge variant="outline">MONITORING</Badge>;
      default: return <Badge variant="secondary">STANDBY</Badge>;
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg">
      <div className={`mt-1 ${getStatusColor()}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-foreground">{title}</h4>
          {getStatusBadge()}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

const WorkflowArrow = () => (
  <div className="flex justify-center">
    <div className="w-0.5 h-6 bg-border"></div>
  </div>
);

const DetectionPhase = () => (
  <div className="space-y-6">
    <div>
      <h3 className="font-semibold text-foreground mb-3">Log Sources & Indicators</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LogSourceCard 
          icon={<Network className="h-5 w-5" />}
          title="Network Telemetry"
          indicators={[
            "Firewall deny logs to C2 IPs",
            "Proxy logs with suspicious domains",
            "NetFlow anomalies (data exfil patterns)",
            "DNS queries to malicious domains",
            "TLS cert anomalies"
          ]}
        />
        <LogSourceCard 
          icon={<Monitor className="h-5 w-5" />}
          title="Windows Event Logs"
          indicators={[
            "EventID 4688: Process creation",
            "EventID 4624/4625: Logon events",
            "Sysmon Event 1: Process creation",
            "Sysmon Event 3: Network connection",
            "PowerShell ScriptBlock logging"
          ]}
        />
        <LogSourceCard 
          icon={<Shield className="h-5 w-5" />}
          title="EDR/Endpoint Logs"
          indicators={[
            "Unsigned process execution",
            "Memory injection alerts",
            "Registry modification events",
            "File creation in suspicious paths",
            "Behavioral detections"
          ]}
        />
      </div>
    </div>

    <div>
      <h3 className="font-semibold text-foreground mb-3">Detection Queries</h3>
      <div className="space-y-4">
        <QueryCard 
          platform="Splunk SPL"
          query={`index=windows EventCode=4688 
| where match(CommandLine, "(?i)(mimikatz|psexec|cobalt)")
| eval technique="T1003 - Credential Dumping"
| stats count by Computer, User, CommandLine, technique
| where count > 0`}
          description="Detects known malware tools (Mimikatz, PSExec, Cobalt Strike)"
        />
        <QueryCard 
          platform="KQL (Microsoft Sentinel)"
          query={`SecurityEvent
| where EventID == 4688
| where ProcessCommandLine has_any ("mimikatz", "psexec", "cobalt")
| extend Technique = "T1003 - Credential Dumping"
| project TimeGenerated, Computer, Account, ProcessCommandLine, Technique`}
          description="Hunt for credential theft tools in process creation events"
        />
        <QueryCard 
          platform="Sigma Rule"
          query={`title: Encoded PowerShell Command
status: stable
logsource:
  product: windows
  service: powershell
detection:
  selection:
    EventID: 4104
    ScriptBlockText|contains:
      - '-enc'
      - '-encodedcommand'
  condition: selection
falsepositives:
  - Legitimate admin scripts
level: high`}
          description="Detects obfuscated PowerShell execution"
        />
      </div>
    </div>

    <div className="bg-background/50 border border-border rounded-lg p-4">
      <h4 className="font-semibold text-foreground mb-2">Correlation Logic</h4>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p><span className="text-foreground font-mono">IF</span> (credential_dumping_tool_detected <span className="text-foreground font-mono">AND</span> network_connection_to_c2) <span className="text-foreground font-mono">THEN</span> severity = CRITICAL</p>
        <p><span className="text-foreground font-mono">IF</span> (same_technique_count &gt; 3 <span className="text-foreground font-mono">WITHIN</span> 5_minutes) <span className="text-foreground font-mono">THEN</span> campaign = "APT_Campaign"</p>
        <p><span className="text-foreground font-mono">IF</span> (persistence_mechanism <span className="text-foreground font-mono">AND</span> command_injection) <span className="text-foreground font-mono">THEN</span> campaign = "Web_Attack"</p>
      </div>
    </div>
  </div>
);

const ContainmentPhase = () => (
  <div className="space-y-6">
    <div>
      <h3 className="font-semibold text-foreground mb-3">Automated Isolation Steps</h3>
      <div className="space-y-3">
        <IsolationStep 
          priority="immediate"
          title="1. Endpoint Quarantine"
          description="Isolate infected host from network while preserving forensic state"
          script={`# PowerShell - Isolate endpoint via Windows Firewall
New-NetFirewallRule -DisplayName "IR_Quarantine_Outbound" \\
  -Direction Outbound -Action Block -Enabled True

New-NetFirewallRule -DisplayName "IR_Quarantine_Inbound" \\
  -Direction Inbound -Action Block -Enabled True

# Allow only C2 SIEM connections
New-NetFirewallRule -DisplayName "IR_Allow_SIEM" \\
  -Direction Outbound -RemoteAddress 10.0.0.100 \\
  -Action Allow -Enabled True

Write-Host "Endpoint isolated. SIEM communication maintained."`}
        />
        <IsolationStep 
          priority="immediate"
          title="2. Kill Malicious Process"
          description="Terminate suspicious processes identified by detection phase"
          script={`# Terminate process by name (safe - read-only check first)
Get-Process | Where-Object {$_.ProcessName -like "*mimikatz*"} | 
  ForEach-Object {
    Write-Host "Terminating PID $($_.Id): $($_.ProcessName)"
    Stop-Process -Id $_.Id -Force
  }

# Log termination for forensics
Get-Process | Where-Object {$_.ProcessName -like "*mimikatz*"} |
  Export-Csv -Path "C:\\IR\\terminated_processes.csv"`}
        />
        <IsolationStep 
          priority="high"
          title="3. Network Segmentation"
          description="VLAN isolation and firewall rule updates"
          script={`# Pseudo-API call to firewall/SIEM
Invoke-RestMethod -Uri "https://firewall-api.internal/isolate" \\
  -Method POST -Body @{
    host_ip = "192.168.1.100"
    action = "block_all_except_siem"
    reason = "malware_containment"
    incident_id = "INC-2024-001"
  } | ConvertTo-Json`}
        />
        <IsolationStep 
          priority="high"
          title="4. Account Lockdown"
          description="Disable compromised user accounts and reset credentials"
          script={`# Disable compromised user account
Disable-ADAccount -Identity "hacker_account"

# Force password reset on next logon for affected users
Set-ADUser -Identity "compromised_user" \\
  -ChangePasswordAtLogon $true

# Revoke active sessions
Get-ADUser -Identity "compromised_user" | 
  Revoke-ADUserSession -Confirm:$false

Write-Host "Account locked. Sessions revoked."`}
        />
      </div>
    </div>

    <div className="bg-background/50 border border-border rounded-lg p-4">
      <h4 className="font-semibold text-foreground mb-3">Verification Checks</h4>
      <div className="space-y-2 text-sm">
        <VerificationCheck check="Confirm no active network connections from isolated host" />
        <VerificationCheck check="Verify malicious process is terminated (not restarted)" />
        <VerificationCheck check="Validate firewall rules applied successfully" />
        <VerificationCheck check="Check for persistence mechanisms (scheduled tasks, registry)" />
        <VerificationCheck check="Ensure forensic artifacts preserved (memory dump, disk image)" />
      </div>
    </div>
  </div>
);

const EradicationPhase = () => (
  <div className="space-y-6">
    <div>
      <h3 className="font-semibold text-foreground mb-3">Artifact Removal Procedures</h3>
      <div className="space-y-3">
        <EradicationStep 
          title="1. Memory Analysis & Dump"
          description="Capture volatile evidence before system reboot"
          procedure={`# Acquire memory dump using WinPmem or similar
& "C:\\Tools\\winpmem.exe" "C:\\IR\\memory_dump.raw"

# Analyze with Volatility
volatility -f memory_dump.raw --profile=Win10x64 pslist
volatility -f memory_dump.raw --profile=Win10x64 netscan
volatility -f memory_dump.raw --profile=Win10x64 malfind`}
        />
        <EradicationStep 
          title="2. File System Cleanup"
          description="Remove malicious files and executables"
          procedure={`# Identify and remove malware files
$malware_paths = @(
  "C:\\Windows\\Temp\\backdoor.exe",
  "C:\\Users\\*\\AppData\\Local\\malware.dll"
)

foreach ($path in $malware_paths) {
  if (Test-Path $path) {
    Remove-Item -Path $path -Force
    Write-Host "Removed: $path"
  }
}

# Scan with Windows Defender
Start-MpScan -ScanType FullScan`}
        />
        <EradicationStep 
          title="3. Registry Cleanup"
          description="Remove persistence keys and malicious entries"
          procedure={`# Remove malicious Run keys
$reg_keys = @(
  "HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\Backdoor",
  "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\Malware"
)

foreach ($key in $reg_keys) {
  if (Test-Path $key) {
    Remove-ItemProperty -Path (Split-Path $key) \\
      -Name (Split-Path $key -Leaf) -Force
    Write-Host "Removed registry key: $key"
  }
}`}
        />
        <EradicationStep 
          title="4. Scheduled Task Removal"
          description="Delete malicious scheduled tasks"
          procedure={`# List and remove suspicious scheduled tasks
Get-ScheduledTask | Where-Object {
  $_.TaskName -like "*SystemUpdate*" -or 
  $_.TaskName -like "*Backdoor*"
} | ForEach-Object {
  Unregister-ScheduledTask -TaskName $_.TaskName -Confirm:$false
  Write-Host "Removed scheduled task: $($_.TaskName)"
}`}
        />
        <EradicationStep 
          title="5. System Integrity Restoration"
          description="Verify and repair system files"
          procedure={`# Run System File Checker
sfc /scannow

# Repair Windows image
DISM /Online /Cleanup-Image /RestoreHealth

# Verify boot integrity
bcdedit /enum {current}

# Update antivirus signatures
Update-MpSignature
Start-MpScan -ScanType QuickScan`}
        />
      </div>
    </div>
  </div>
);

const AutomationPipeline = () => (
  <div className="space-y-6">
    <div>
      <h3 className="font-semibold text-foreground mb-3">Live Automation Flow</h3>
      <div className="bg-background/50 border border-border rounded-lg p-4 font-mono text-sm space-y-2">
        <div className="text-primary">// Log ingestion pipeline</div>
        <div>LOG_SOURCE → SIEM_FORWARDER → NORMALIZATION → STORAGE</div>
        
        <div className="text-primary mt-4">// Detection workflow</div>
        <div>IF (pattern_match(log_entry, MALWARE_PATTERNS)):</div>
        <div className="pl-4">threat = create_threat_object()</div>
        <div className="pl-4">correlate_with_existing_threats(threat)</div>
        <div className="pl-4">IF (correlation_confidence &gt; 0.8):</div>
        <div className="pl-8">trigger_automated_containment(threat)</div>
        
        <div className="text-primary mt-4">// Containment workflow</div>
        <div>IF (severity == "CRITICAL"):</div>
        <div className="pl-4">execute_isolation_script(endpoint_id)</div>
        <div className="pl-4">kill_malicious_process(process_id)</div>
        <div className="pl-4">block_network_traffic(ip_address)</div>
        <div className="pl-4">disable_compromised_accounts(user_list)</div>
        <div className="pl-4">send_alert(["email", "slack", "siem_dashboard"])</div>
        
        <div className="text-primary mt-4">// Verification loop</div>
        <div>WHILE (threat_active == true):</div>
        <div className="pl-4">check_process_status()</div>
        <div className="pl-4">check_network_connections()</div>
        <div className="pl-4">IF (all_checks_pass):</div>
        <div className="pl-8">threat_active = false</div>
        <div className="pl-8">proceed_to_eradication()</div>
      </div>
    </div>

    <div>
      <h3 className="font-semibold text-foreground mb-3">Alert Integration Examples</h3>
      <div className="space-y-3">
        <AlertIntegration 
          platform="Email (SMTP)"
          code={`# PowerShell - Send alert email
$smtp = @{
  SmtpServer = "smtp.company.com"
  From = "siem@company.com"
  To = "soc@company.com"
  Subject = "CRITICAL: Malware Detection - $($threat.type)"
  Body = @"
Threat Details:
- Type: $($threat.type)
- Severity: $($threat.severity)
- Endpoint: $($threat.endpoint)
- Technique: $($threat.technique)
- Timestamp: $($threat.timestamp)

Automated containment initiated.
"@
}
Send-MailMessage @smtp`}
        />
        <AlertIntegration 
          platform="Slack Webhook"
          code={`# PowerShell - Send Slack alert
$webhook = "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
$payload = @{
  text = "🚨 CRITICAL MALWARE DETECTION"
  attachments = @(
    @{
      color = "danger"
      fields = @(
        @{ title = "Type"; value = "$($threat.type)"; short = $true }
        @{ title = "Severity"; value = "$($threat.severity)"; short = $true }
        @{ title = "Endpoint"; value = "$($threat.endpoint)"; short = $true }
        @{ title = "Technique"; value = "$($threat.technique)"; short = $true }
      )
    }
  )
} | ConvertTo-Json -Depth 4

Invoke-RestMethod -Uri $webhook -Method Post \\
  -Body $payload -ContentType "application/json"`}
        />
        <AlertIntegration 
          platform="SIEM Dashboard API"
          code={`# Create incident ticket in SIEM
Invoke-RestMethod -Uri "https://siem.company.com/api/incidents" \\
  -Method POST \\
  -Headers @{ "Authorization" = "Bearer $api_token" } \\
  -Body (@{
    title = "Malware Detection: $($threat.type)"
    severity = "critical"
    status = "open"
    assignee = "soc_team"
    details = $threat | ConvertTo-Json
  } | ConvertTo-Json)`}
        />
      </div>
    </div>
  </div>
);

// Helper components
const LogSourceCard = ({ icon, title, indicators }: { icon: React.ReactNode; title: string; indicators: string[] }) => (
  <div className="bg-background/50 border border-border rounded-lg p-4">
    <div className="flex items-center gap-2 mb-3">
      <div className="text-primary">{icon}</div>
      <h4 className="font-semibold text-foreground">{title}</h4>
    </div>
    <ul className="space-y-1 text-sm text-muted-foreground">
      {indicators.map((indicator, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          <span>{indicator}</span>
        </li>
      ))}
    </ul>
  </div>
);

const QueryCard = ({ platform, query, description }: { platform: string; query: string; description: string }) => (
  <div className="bg-background/50 border border-border rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <Badge variant="outline">{platform}</Badge>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
    <pre className="bg-background p-3 rounded border border-border overflow-x-auto">
      <code className="text-xs text-foreground">{query}</code>
    </pre>
  </div>
);

const IsolationStep = ({ priority, title, description, script }: {
  priority: string;
  title: string;
  description: string;
  script: string;
}) => (
  <div className="bg-background/50 border border-border rounded-lg p-4">
    <div className="flex items-start gap-3 mb-2">
      <Badge variant={priority === "immediate" ? "destructive" : "default"}>
        {priority.toUpperCase()}
      </Badge>
      <div className="flex-1">
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
    <pre className="bg-background p-3 rounded border border-border overflow-x-auto mt-3">
      <code className="text-xs text-foreground">{script}</code>
    </pre>
  </div>
);

const EradicationStep = ({ title, description, procedure }: {
  title: string;
  description: string;
  procedure: string;
}) => (
  <div className="bg-background/50 border border-border rounded-lg p-4">
    <h4 className="font-semibold text-foreground mb-1">{title}</h4>
    <p className="text-sm text-muted-foreground mb-3">{description}</p>
    <pre className="bg-background p-3 rounded border border-border overflow-x-auto">
      <code className="text-xs text-foreground">{procedure}</code>
    </pre>
  </div>
);

const AlertIntegration = ({ platform, code }: { platform: string; code: string }) => (
  <div className="bg-background/50 border border-border rounded-lg p-4">
    <Badge variant="outline" className="mb-3">{platform}</Badge>
    <pre className="bg-background p-3 rounded border border-border overflow-x-auto">
      <code className="text-xs text-foreground">{code}</code>
    </pre>
  </div>
);

const VerificationCheck = ({ check }: { check: string }) => (
  <div className="flex items-start gap-2">
    <div className="h-5 w-5 rounded border-2 border-primary mt-0.5 flex items-center justify-center">
      <div className="h-2 w-2 bg-primary rounded-sm"></div>
    </div>
    <span className="text-foreground">{check}</span>
  </div>
);