import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Play } from "lucide-react";
import { toast } from "sonner";

interface LogAnalyzerProps {
  onAnalyze: (logs: string[]) => void;
}

export const LogAnalyzer = ({ onAnalyze }: LogAnalyzerProps) => {
  const [logInput, setLogInput] = useState(`2024-01-15 10:30:45 EventID:4688 Process created: powershell.exe -enc JABhAD0AJwBoAHQAdABwADoALwAvAG0AYQBsAGkAYwBpAG8AdQBzAC4AYwBvAG0AJwA=
2024-01-15 10:31:12 EventID:4688 Process created: cmd.exe /c echo malware > C:\\Windows\\Temp\\backdoor.exe
2024-01-15 10:32:03 Security Alert: mimikatz.exe detected attempting credential theft
2024-01-15 10:33:21 EventID:4688 Process created: rundll32.exe javascript:alert('malware')
2024-01-15 10:34:15 EventID:4688 Process created: schtasks /create /tn "SystemUpdate" /tr "C:\\malware.exe" /sc onstart /ru system
2024-01-15 10:35:42 EventID:4688 Process created: net user hacker Password123! /add
2024-01-15 10:36:18 EventID:4688 Process created: net localgroup administrators hacker /add
2024-01-15 10:37:05 EventID:4688 Process created: reg add HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v Backdoor /t REG_SZ /d "C:\\malware.exe"
2024-01-15 10:38:22 EventID:4688 Process created: wmic process call create "cmd.exe /c malicious.bat"
2024-01-15 10:39:10 EventID:4624 Logon Type 3: User Administrator from 192.168.1.100
2024-01-15 10:40:05 Firewall: Block TCP connection to suspicious-domain.com:443`);

  const handleAnalyze = () => {
    if (!logInput.trim()) {
      toast.error("Please enter logs to analyze");
      return;
    }

    const logs = logInput.split("\n").filter(line => line.trim());
    onAnalyze(logs);
    toast.success(`Analyzing ${logs.length} log entries...`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setLogInput(content);
      toast.success("Log file loaded successfully");
    };
    reader.readAsText(file);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Log Ingestion</CardTitle>
        <CardDescription className="text-muted-foreground">
          Upload or paste Windows Event, Firewall, or Sysmon logs for analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-secondary"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Log File
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".log,.txt,.evtx"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        <Textarea
          placeholder="Paste log entries here (one per line)...&#10;Example:&#10;2024-01-15 10:30:45 EventID:4688 Process created: powershell.exe -enc ..."
          value={logInput}
          onChange={(e) => setLogInput(e.target.value)}
          className="min-h-[200px] font-mono text-sm bg-background border-border text-foreground"
        />

        <Button 
          onClick={handleAnalyze}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Play className="h-4 w-4 mr-2" />
          Analyze Logs
        </Button>
      </CardContent>
    </Card>
  );
};
