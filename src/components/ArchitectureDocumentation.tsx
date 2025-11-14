import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Server, Shield, Activity, Database, AlertTriangle } from "lucide-react";

export const ArchitectureDocumentation = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Network className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">System Architecture</h2>
          <p className="text-sm text-muted-foreground">Multi-Device IPv4-Based SIEM/SOAR Platform</p>
        </div>
      </div>

      <Tabs defaultValue="architecture" className="space-y-4">
        <TabsList>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="dataflow">Data Flow</TabsTrigger>
          <TabsTrigger value="installation">Agent Setup</TabsTrigger>
          <TabsTrigger value="detection">Detection Logic</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="space-y-4">
          <div className="border border-border rounded-lg p-4 bg-muted/50">
            <h3 className="font-semibold text-foreground mb-4">System Components</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Server className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">Central Manager</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Core SIEM/SOAR platform that aggregates logs, correlates threats, and orchestrates responses.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>IPv4 Address: 192.168.10.50 (example)</li>
                    <li>Listening Port: 1514 (TLS-encrypted)</li>
                    <li>Components: Analysis Engine, Correlation Engine, SOAR Orchestrator, Web Dashboard</li>
                    <li>Database: PostgreSQL for log storage and threat intelligence</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Network className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">Lightweight Agents</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Endpoint agents installed on Windows, Linux, and macOS devices.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Collects: Sysmon, Event Logs, PowerShell logs, WMI events, Network connections</li>
                    <li>Communicates via IPv4 to central manager</li>
                    <li>Sends heartbeat every 30 seconds</li>
                    <li>Executes safe remote commands (isolate, collect evidence, scan)</li>
                    <li>Local firewall integration for isolation</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">Threat Intelligence Database</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Stores IOCs, malware signatures, MITRE ATT&CK mappings, and historical threat data.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Updates daily from threat feeds</li>
                    <li>Custom IOC management</li>
                    <li>Correlation rules and Sigma signatures</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3">Network Topology</h3>
            <pre className="text-xs font-mono bg-muted p-4 rounded overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────┐
│                    Central Manager                          │
│                   192.168.10.50:1514                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Analysis   │  │ Correlation  │  │     SOAR     │     │
│  │    Engine    │  │    Engine    │  │ Orchestrator │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
                  ┌────────┴─────────┐
                  │   IPv4 Network   │
                  │   (TLS Secured)  │
                  └────────┬─────────┘
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼────┐      ┌───▼────┐      ┌───▼────┐
    │ Agent 1 │      │Agent 2 │      │Agent 3 │
    │192.168. │      │192.168.│      │192.168.│
    │ 10.15   │      │ 10.88  │      │ 20.50  │
    │Windows  │      │ macOS  │      │ Linux  │
    └─────────┘      └────────┘      └────────┘
    
    ┌─────────────────────────────────────────┐
    │  Subnet Grouping (Auto-detected)        │
    │  • 192.168.10.0/24 - Corporate          │
    │  • 192.168.20.0/24 - DMZ                │
    │  • 192.168.30.0/24 - Database Servers   │
    └─────────────────────────────────────────┘`}
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="dataflow" className="space-y-4">
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3">Complete Data Pipeline</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-foreground mb-1">1. Log Collection</h4>
                <p className="text-sm text-muted-foreground">
                  Agents collect logs from multiple sources: Sysmon (Process creation, Network connections, File creation), 
                  Windows Event Logs (Security, System, Application), PowerShell logs, WMI events, EDR telemetry
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-foreground mb-1">2. Real-Time Forwarding</h4>
                <p className="text-sm text-muted-foreground">
                  Logs sent over IPv4 (TLS 1.3) to central manager on port 1514. Compression and batching for efficiency. 
                  Heartbeat every 30s ensures connectivity.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-foreground mb-1">3. Log Parsing & Normalization</h4>
                <p className="text-sm text-muted-foreground">
                  Manager parses logs into common format. Extracts: timestamp, source IP, process name, command line, 
                  user, file paths, registry keys, network connections.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold text-foreground mb-1">4. Detection & Correlation</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Analysis engine applies detection rules (Sigma, YARA, custom regex). Correlation engine groups related events.
                </p>
                <pre className="text-xs font-mono bg-muted p-2 rounded">
{`IF (suspicious_powershell_detected) AND
   (network_c2_beacon_detected) AND
   (same_source_ip) THEN
   risk_score = HIGH
   trigger_alert("Confirmed C2 Communication")`}
                </pre>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-foreground mb-1">5. Automated Response (SOAR)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  If risk_score &gt; threshold, SOAR orchestrator executes playbook:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Send isolation command to agent via IPv4</li>
                  <li>Agent applies local firewall rules (block all except manager)</li>
                  <li>Collect memory snapshot and evidence</li>
                  <li>Alert SOC via Email/Slack/Teams</li>
                  <li>Log action in audit trail</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-foreground mb-1">6. Dashboard & Reporting</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time metrics displayed on dashboard. Analysts can manually trigger actions. 
                  Automated report generation for management and compliance.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="installation" className="space-y-4">
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3">Agent Installation Process</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Step 1: Download Agent Package</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  SOC admin downloads platform-specific agent installer:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-4">
                  <li>Windows: cyberguard-agent-win64-v4.5.2.msi</li>
                  <li>Linux: cyberguard-agent-linux-v4.5.2.deb / .rpm</li>
                  <li>macOS: cyberguard-agent-macos-v4.5.2.pkg</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Step 2: Configure Manager IPv4</h4>
                <pre className="text-xs font-mono bg-muted p-3 rounded overflow-x-auto">
{`# During installation, agent prompts for:
Manager IPv4 Address: 192.168.10.50
Manager Port: 1514
TLS Enabled: YES
Agent Name: [auto-detected or custom]

# Agent generates unique Device ID and keypair
Device ID: agent-a3f2b9e1
Public Key: [generated RSA 4096]`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Step 3: Registration Handshake</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Agent initiates secure registration with manager:
                </p>
                <pre className="text-xs font-mono bg-muted p-3 rounded overflow-x-auto">
{`Agent -> Manager (TLS):
{
  "action": "register",
  "device_id": "agent-a3f2b9e1",
  "hostname": "WORKSTATION-01",
  "ipv4": "192.168.10.15",
  "os": "Windows 11 Pro",
  "version": "v4.5.2",
  "public_key": "..."
}

Manager -> Agent:
{
  "status": "approved",
  "agent_id": "agent-001",
  "config": {
    "heartbeat_interval": 30,
    "log_batch_size": 100,
    "enabled_collectors": ["sysmon", "event_logs", "powershell"]
  }
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Step 4: Start Monitoring</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Agent appears in dashboard as "ONLINE" and begins sending telemetry. Manager can now:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-4">
                  <li>View real-time logs from this device</li>
                  <li>Send isolation commands</li>
                  <li>Collect evidence remotely</li>
                  <li>Run health checks</li>
                  <li>Update agent configuration</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="detection" className="space-y-4">
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3">Multi-Device Correlation Logic</h3>
            
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Scenario: Lateral Movement Detection</h4>
                <pre className="text-xs font-mono bg-background p-3 rounded overflow-x-auto mt-2">
{`# Pseudocode Detection Pipeline

STEP 1: Collect Events from Multiple Devices
  Device A (192.168.10.15): 
    - Failed login attempts (Event ID 4625)
  Device B (192.168.10.20):
    - Successful login from Device A IP
    - Suspicious PowerShell execution
  Device C (192.168.10.25):
    - WMI remote execution from Device B

STEP 2: Correlate Across IPv4 Addresses
  IF (failed_login_source == device_A_ip) AND
     (successful_login_source == device_A_ip) AND
     (suspicious_activity_on_device_B) AND
     (wmi_remote_execution_from_device_B) AND
     (time_window < 10_minutes) THEN
     
     ALERT: "Lateral Movement Detected"
     CAMPAIGN: "Pass-the-Hash + WMI Execution"
     AFFECTED_DEVICES: [A, B, C]
     RECOMMENDED_ACTION: "Isolate all three devices"

STEP 3: Risk Scoring
  base_risk = 50
  IF (credential_theft_indicators): risk += 20
  IF (remote_execution): risk += 15
  IF (multiple_devices_in_subnet): risk += 15
  
  IF (total_risk > 80): AUTO_ISOLATE = TRUE

STEP 4: Execute SOAR Playbook
  FOR each device IN affected_devices:
    send_command(device.ipv4, "isolate")
    collect_evidence(device.ipv4)
    disable_user_account(compromised_user)
  
  notify_soc_team(alert_details)
  log_chain_of_custody()`}
                </pre>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Example Detection Queries</h4>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Splunk Query - Suspicious PowerShell</p>
                    <pre className="text-xs font-mono bg-background p-2 rounded overflow-x-auto">
{`index=windows sourcetype=WinEventLog:PowerShell
| search EventCode=4104 
| where match(ScriptBlockText, "(?i)(Invoke-Expression|IEX|DownloadString|EncodedCommand)")
| stats count by ComputerName, src_ip, User
| where count > 5`}
                    </pre>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">KQL Query - Network C2 Beaconing</p>
                    <pre className="text-xs font-mono bg-background p-2 rounded overflow-x-auto">
{`Sysmon
| where EventID == 3  // Network Connection
| where DestinationPort in (443, 8080, 8443)
| summarize count() by SourceIp, DestinationIp, bin(TimeGenerated, 5m)
| where count_ > 10  // Regular beaconing pattern
| project TimeGenerated, SourceIp, DestinationIp, BeaconCount=count_`}
                    </pre>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Sigma Rule - Mimikatz Execution</p>
                    <pre className="text-xs font-mono bg-background p-2 rounded overflow-x-auto">
{`title: Mimikatz Execution Detection
status: stable
logsource:
  product: windows
  service: sysmon
detection:
  selection:
    EventID: 1
    CommandLine|contains:
      - 'sekurlsa::logonpasswords'
      - 'lsadump::sam'
  condition: selection
level: critical`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
