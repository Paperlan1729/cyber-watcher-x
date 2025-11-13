export interface Threat {
  id: string;
  severity: "critical" | "warning" | "info";
  type: string;
  description: string;
  logEntry: string;
  timestamp: number;
  mitigation: string;
  technique: string;
  campaign?: string;
}

export interface ThreatCorrelation {
  technique: string;
  count: number;
  threatIds: string[];
  campaign?: string;
}

const MALWARE_PATTERNS = {
  critical: [
    { 
      pattern: /mimikatz|psexec|cobalt.*strike/i, 
      type: "Credential Theft", 
      desc: "Known malware tool detected",
      mitigation: "Immediately isolate affected system. Kill malicious process. Run full antivirus scan. Reset all credentials on the system. Review access logs for lateral movement. Enable credential protection (Credential Guard).",
      technique: "T1003 - Credential Dumping",
      campaign: "APT Campaign"
    },
    { 
      pattern: /powershell.*-enc|-encodedcommand/i, 
      type: "Encoded PowerShell", 
      desc: "Obfuscated PowerShell execution",
      mitigation: "Terminate PowerShell process. Analyze decoded script content. Block script execution via AppLocker or Windows Defender Application Control. Enable PowerShell logging and transcription. Review process parent/child relationships.",
      technique: "T1059.001 - PowerShell",
      campaign: "APT Campaign"
    },
    { 
      pattern: /cmd.*\/c.*echo.*>|certutil.*-decode/i, 
      type: "Command Injection", 
      desc: "Suspicious command execution",
      mitigation: "Kill command prompt process immediately. Delete any files created. Scan system for webshells or backdoors. Patch vulnerable application. Implement input validation. Review web server logs for injection attempts.",
      technique: "T1059.003 - Command Shell",
      campaign: "Web Attack"
    },
    { 
      pattern: /rundll32.*javascript:|regsvr32.*scrobj/i, 
      type: "Living-off-the-Land", 
      desc: "Fileless malware technique",
      mitigation: "Block malicious process via firewall. Use application whitelisting to prevent abuse of system binaries. Enable Attack Surface Reduction rules. Monitor for unsigned DLLs. Check for persistence mechanisms in registry and scheduled tasks.",
      technique: "T1218 - System Binary Proxy",
      campaign: "APT Campaign"
    },
    { 
      pattern: /schtasks.*\/create.*system/i, 
      type: "Persistence", 
      desc: "Scheduled task for persistence",
      mitigation: "Delete malicious scheduled task immediately. Review all scheduled tasks for anomalies. Check task executable location and digital signature. Monitor task scheduler logs. Restrict task creation permissions to administrators only.",
      technique: "T1053.005 - Scheduled Task",
      campaign: "APT Campaign"
    },
  ],
  warning: [
    { 
      pattern: /net.*user.*\/add|net.*localgroup.*administrators/i, 
      type: "User Manipulation", 
      desc: "User account modification",
      mitigation: "Review and remove unauthorized user accounts. Verify legitimate administrative changes. Enable alerts for user/group modifications. Implement least privilege access. Audit admin account usage regularly.",
      technique: "T1136 - Create Account",
      campaign: "Insider Threat"
    },
    { 
      pattern: /reg.*add.*\\software\\microsoft\\windows\\currentversion\\run/i, 
      type: "Registry Persistence", 
      desc: "Startup registry modification",
      mitigation: "Remove malicious registry keys. Scan referenced executable with antivirus. Monitor registry Run keys for changes. Use autoruns tool to identify persistence. Enable registry auditing for sensitive keys.",
      technique: "T1547.001 - Registry Run Keys",
      campaign: "APT Campaign"
    },
    { 
      pattern: /wmic.*process.*call.*create/i, 
      type: "Process Creation", 
      desc: "WMI process execution",
      mitigation: "Investigate process chain and parent process. Disable WMI if not required. Monitor WMI event logs. Implement network segmentation. Review WMI subscriptions for persistence. Enable WMI activity logging.",
      technique: "T1047 - Windows Management",
      campaign: "APT Campaign"
    },
    { 
      pattern: /explorer.*exe.*\.\.|cmd.*start.*http/i, 
      type: "Suspicious Browser", 
      desc: "Unusual browser launch pattern",
      mitigation: "Block suspicious URL at firewall/proxy. Terminate browser process. Scan system for malware. Review browser extensions and plugins. Implement web content filtering. Educate users on phishing awareness.",
      technique: "T1204.001 - User Execution",
      campaign: "Phishing"
    },
  ],
  info: [
    { 
      pattern: /eventid:\s*4688/i, 
      type: "Process Created", 
      desc: "New process execution logged",
      mitigation: "Review process details and command line arguments. Verify process is legitimate. Monitor for unusual process patterns. Baseline normal process behavior for comparison.",
      technique: "T1106 - Native API",
      campaign: "Normal Activity"
    },
    { 
      pattern: /eventid:\s*4624/i, 
      type: "Logon Event", 
      desc: "User authentication event",
      mitigation: "Verify logon is expected and from known location. Check for failed logon attempts. Monitor for unusual logon times or source IPs. Enable MFA for all accounts.",
      technique: "T1078 - Valid Accounts",
      campaign: "Normal Activity"
    },
    { 
      pattern: /firewall.*block/i, 
      type: "Firewall Block", 
      desc: "Connection blocked by firewall",
      mitigation: "Investigate destination IP/domain reputation. Review firewall rules for effectiveness. Check if legitimate traffic is being blocked. Update threat intelligence feeds. Document false positives.",
      technique: "T1071 - Application Layer",
      campaign: "Normal Activity"
    },
  ]
};

export const detectThreats = (logs: string[]): Threat[] => {
  const threats: Threat[] = [];
  console.log("Starting threat detection for", logs.length, "logs");

  logs.forEach((log, index) => {
    console.log(`Checking log ${index + 1}:`, log.substring(0, 100));
    // Check critical patterns
    for (const { pattern, type, desc, mitigation, technique, campaign } of MALWARE_PATTERNS.critical) {
      if (pattern.test(log)) {
        threats.push({
          id: `threat-${Date.now()}-${index}`,
          severity: "critical",
          type,
          description: desc,
          logEntry: log,
          timestamp: Date.now(),
          mitigation,
          technique,
          campaign
        });
        return; // One threat per log entry
      }
    }

    // Check warning patterns
    for (const { pattern, type, desc, mitigation, technique, campaign } of MALWARE_PATTERNS.warning) {
      if (pattern.test(log)) {
        threats.push({
          id: `threat-${Date.now()}-${index}`,
          severity: "warning",
          type,
          description: desc,
          logEntry: log,
          timestamp: Date.now(),
          mitigation,
          technique,
          campaign
        });
        return;
      }
    }

    // Check info patterns
    for (const { pattern, type, desc, mitigation, technique, campaign } of MALWARE_PATTERNS.info) {
      if (pattern.test(log)) {
        threats.push({
          id: `threat-${Date.now()}-${index}`,
          severity: "info",
          type,
          description: desc,
          logEntry: log,
          timestamp: Date.now(),
          mitigation,
          technique,
          campaign
        });
        return;
      }
    }
  });

  console.log("Detected", threats.length, "threats");
  return threats;
};

export const correlatThreats = (threats: Threat[]): ThreatCorrelation[] => {
  const correlationMap = new Map<string, ThreatCorrelation>();
  
  threats.forEach(threat => {
    const key = threat.campaign || threat.technique;
    
    if (correlationMap.has(key)) {
      const existing = correlationMap.get(key)!;
      existing.count++;
      existing.threatIds.push(threat.id);
    } else {
      correlationMap.set(key, {
        technique: threat.technique,
        count: 1,
        threatIds: [threat.id],
        campaign: threat.campaign
      });
    }
  });
  
  return Array.from(correlationMap.values())
    .filter(corr => corr.count > 1)
    .sort((a, b) => b.count - a.count);
};
