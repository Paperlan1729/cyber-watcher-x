export interface Threat {
  id: string;
  severity: "critical" | "warning" | "info";
  type: string;
  description: string;
  logEntry: string;
  timestamp: number;
}

const MALWARE_PATTERNS = {
  critical: [
    { pattern: /mimikatz|psexec|cobalt.*strike/i, type: "Credential Theft", desc: "Known malware tool detected" },
    { pattern: /powershell.*-enc|-encodedcommand/i, type: "Encoded PowerShell", desc: "Obfuscated PowerShell execution" },
    { pattern: /cmd.*\/c.*echo.*>|certutil.*-decode/i, type: "Command Injection", desc: "Suspicious command execution" },
    { pattern: /rundll32.*javascript:|regsvr32.*scrobj/i, type: "Living-off-the-Land", desc: "Fileless malware technique" },
    { pattern: /schtasks.*\/create.*system/i, type: "Persistence", desc: "Scheduled task for persistence" },
  ],
  warning: [
    { pattern: /net.*user.*\/add|net.*localgroup.*administrators/i, type: "User Manipulation", desc: "User account modification" },
    { pattern: /reg.*add.*\\software\\microsoft\\windows\\currentversion\\run/i, type: "Registry Persistence", desc: "Startup registry modification" },
    { pattern: /wmic.*process.*call.*create/i, type: "Process Creation", desc: "WMI process execution" },
    { pattern: /explorer.*exe.*\.\.|cmd.*start.*http/i, type: "Suspicious Browser", desc: "Unusual browser launch pattern" },
  ],
  info: [
    { pattern: /eventid:\s*4688/i, type: "Process Created", desc: "New process execution logged" },
    { pattern: /eventid:\s*4624/i, type: "Logon Event", desc: "User authentication event" },
    { pattern: /firewall.*block/i, type: "Firewall Block", desc: "Connection blocked by firewall" },
  ]
};

export const detectThreats = (logs: string[]): Threat[] => {
  const threats: Threat[] = [];

  logs.forEach((log, index) => {
    // Check critical patterns
    for (const { pattern, type, desc } of MALWARE_PATTERNS.critical) {
      if (pattern.test(log)) {
        threats.push({
          id: `threat-${Date.now()}-${index}`,
          severity: "critical",
          type,
          description: desc,
          logEntry: log,
          timestamp: Date.now()
        });
        return; // One threat per log entry
      }
    }

    // Check warning patterns
    for (const { pattern, type, desc } of MALWARE_PATTERNS.warning) {
      if (pattern.test(log)) {
        threats.push({
          id: `threat-${Date.now()}-${index}`,
          severity: "warning",
          type,
          description: desc,
          logEntry: log,
          timestamp: Date.now()
        });
        return;
      }
    }

    // Check info patterns
    for (const { pattern, type, desc } of MALWARE_PATTERNS.info) {
      if (pattern.test(log)) {
        threats.push({
          id: `threat-${Date.now()}-${index}`,
          severity: "info",
          type,
          description: desc,
          logEntry: log,
          timestamp: Date.now()
        });
        return;
      }
    }
  });

  return threats;
};
