import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, Check, Terminal, Apple, Monitor } from "lucide-react";
import { toast } from "sonner";

const MANAGER_HOST_DEFAULT = "manager.paperlan.io";
const AGENT_VERSION = "4.5.2";

type OS = "linux" | "windows" | "macos";

const CodeBlock = ({ code, id }: { code: string; id: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="bg-muted text-foreground text-xs md:text-sm p-4 rounded-lg overflow-x-auto font-mono border border-border whitespace-pre">
        <code id={id}>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="outline"
        onClick={copy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
};

export const AgentDeployment = () => {
  const [managerHost, setManagerHost] = useState(MANAGER_HOST_DEFAULT);
  const [enrollmentKey, setEnrollmentKey] = useState("PLN-XXXXX-XXXXX-XXXXX");
  const [groupName, setGroupName] = useState("default");

  const generateKey = () => {
    const rand = () =>
      Math.random().toString(36).slice(2, 7).toUpperCase();
    setEnrollmentKey(`PLN-${rand()}-${rand()}-${rand()}`);
    toast.success("New enrollment key generated");
  };

  const linuxCmd = `# PaperLAN Agent ${AGENT_VERSION} — Linux (Debian/Ubuntu & RHEL/CentOS)
curl -sO https://packages.paperlan.io/agent/paperlan-agent-${AGENT_VERSION}.sh
sudo PAPERLAN_MANAGER="${managerHost}" \\
     PAPERLAN_ENROLLMENT_KEY="${enrollmentKey}" \\
     PAPERLAN_GROUP="${groupName}" \\
     bash paperlan-agent-${AGENT_VERSION}.sh

# Start & enable the agent
sudo systemctl daemon-reload
sudo systemctl enable --now paperlan-agent`;

  const windowsCmd = `# PaperLAN Agent ${AGENT_VERSION} — Windows (PowerShell as Administrator)
Invoke-WebRequest -Uri "https://packages.paperlan.io/agent/paperlan-agent-${AGENT_VERSION}.msi" \`
  -OutFile "$env:TEMP\\paperlan-agent.msi"

msiexec.exe /i "$env:TEMP\\paperlan-agent.msi" /quiet /norestart \`
  PAPERLAN_MANAGER="${managerHost}" \`
  PAPERLAN_ENROLLMENT_KEY="${enrollmentKey}" \`
  PAPERLAN_GROUP="${groupName}"

# Start the service
Start-Service -Name "PaperLANAgent"`;

  const macosCmd = `# PaperLAN Agent ${AGENT_VERSION} — macOS (Intel & Apple Silicon)
curl -sO https://packages.paperlan.io/agent/paperlan-agent-${AGENT_VERSION}.pkg
sudo installer -pkg paperlan-agent-${AGENT_VERSION}.pkg -target /

sudo /Library/PaperLAN/agent/bin/agent-control \\
  enroll --manager "${managerHost}" \\
         --key "${enrollmentKey}" \\
         --group "${groupName}"

sudo launchctl load /Library/LaunchDaemons/io.paperlan.agent.plist`;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Deploy Agent</h2>
          <p className="text-sm text-muted-foreground">
            Enroll endpoints to PaperLAN.io with one command
          </p>
        </div>
        <Badge variant="outline" className="ml-auto">v{AGENT_VERSION}</Badge>
      </div>

      {/* Enrollment settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border border-border rounded-lg bg-muted/30">
        <div className="space-y-2">
          <Label htmlFor="manager">Manager Host</Label>
          <Input
            id="manager"
            value={managerHost}
            onChange={(e) => setManagerHost(e.target.value)}
            placeholder="manager.paperlan.io"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="group">Agent Group</Label>
          <Input
            id="group"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="default"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="key">Enrollment Key</Label>
          <div className="flex gap-2">
            <Input
              id="key"
              value={enrollmentKey}
              onChange={(e) => setEnrollmentKey(e.target.value)}
              className="font-mono text-xs"
            />
            <Button variant="outline" size="sm" onClick={generateKey}>
              New
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="linux" className="space-y-4">
        <TabsList>
          <TabsTrigger value="linux" className="gap-2">
            <Terminal className="h-4 w-4" /> Linux
          </TabsTrigger>
          <TabsTrigger value="windows" className="gap-2">
            <Monitor className="h-4 w-4" /> Windows
          </TabsTrigger>
          <TabsTrigger value="macos" className="gap-2">
            <Apple className="h-4 w-4" /> macOS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="linux" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Run as root on Debian, Ubuntu, RHEL, CentOS, Fedora, Amazon Linux, or Alpine.
          </p>
          <CodeBlock code={linuxCmd} id="cmd-linux" />
        </TabsContent>

        <TabsContent value="windows" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Open PowerShell as Administrator. Supports Windows 10, 11, and Server 2016+.
          </p>
          <CodeBlock code={windowsCmd} id="cmd-windows" />
        </TabsContent>

        <TabsContent value="macos" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Works on macOS 12 Monterey and later, both Intel and Apple Silicon.
          </p>
          <CodeBlock code={macosCmd} id="cmd-macos" />
        </TabsContent>
      </Tabs>

      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> the enrollment key authenticates
          the agent against the manager and binds it to the selected group. Rotate keys
          regularly and never share them in public channels.
        </p>
      </div>
    </Card>
  );
};
