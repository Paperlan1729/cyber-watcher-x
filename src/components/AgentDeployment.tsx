import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, Check, Terminal, Apple, Monitor, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const INGEST_URL = `${SUPABASE_URL}/functions/v1/ingest-log`;

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="bg-muted text-foreground text-xs p-4 rounded-lg overflow-x-auto font-mono border border-border whitespace-pre max-h-96">
        <code>{code}</code>
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
  const [enrollmentKey, setEnrollmentKey] = useState("PLN-DEMO-KEY-CHANGE-ME");
  const [keys, setKeys] = useState<{ key: string; group_name: string }[]>([]);

  useEffect(() => {
    supabase
      .from("enrollment_keys")
      .select("key, group_name, revoked")
      .eq("revoked", false)
      .then(({ data }) => {
        if (data && data.length) {
          setKeys(data);
          setEnrollmentKey(data[0].key);
        }
      });
  }, []);

  // Windows PowerShell agent — collects System + Security events & ships them to the edge function
  const windowsCmd = `# PaperLAN Agent — Windows (run in PowerShell as Administrator)
$INGEST = "${INGEST_URL}"
$KEY    = "${enrollmentKey}"
$APIKEY = "${SUPABASE_ANON}"
$INTERVAL = 30   # seconds between pushes

$script = {
  param($INGEST, $KEY, $APIKEY, $INTERVAL)
  $since = (Get-Date).AddMinutes(-5)
  while ($true) {
    try {
      $events = @()
      foreach ($log in @('System','Application','Security')) {
        try {
          Get-WinEvent -FilterHashtable @{LogName=$log; StartTime=$since} -MaxEvents 100 -ErrorAction SilentlyContinue |
            ForEach-Object {
              $events += @{
                source     = "windows/$log"
                level      = switch ($_.LevelDisplayName) { 'Error' {'error'} 'Warning' {'warning'} 'Critical' {'critical'} default {'info'} }
                message    = ($_.Message -replace "\`r\`n"," ").Substring(0,[Math]::Min(2000,$_.Message.Length))
                event_time = $_.TimeCreated.ToUniversalTime().ToString("o")
                raw        = @{ id=$_.Id; provider=$_.ProviderName }
              }
            }
        } catch {}
      }

      if ($events.Count -gt 0) {
        $body = @{
          hostname      = $env:COMPUTERNAME
          os            = "Windows " + [System.Environment]::OSVersion.Version.ToString()
          ip_address    = (Get-NetIPAddress -AddressFamily IPv4 -PrefixOrigin Dhcp,Manual -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty IPAddress)
          agent_version = "paperlan-ps-1.0.0"
          events        = $events
        } | ConvertTo-Json -Depth 6 -Compress

        Invoke-RestMethod -Uri $INGEST -Method Post -Body $body \`
          -Headers @{ "x-enrollment-key"=$KEY; "apikey"=$APIKEY; "Authorization"="Bearer $APIKEY" } \`
          -ContentType "application/json" | Out-Null

        Write-Host "[$(Get-Date -Format o)] shipped $($events.Count) events"
      } else {
        # Heartbeat with empty events
        $hb = @{ hostname=$env:COMPUTERNAME; os="Windows"; agent_version="paperlan-ps-1.0.0"; events=@() } | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri $INGEST -Method Post -Body $hb \`
          -Headers @{ "x-enrollment-key"=$KEY; "apikey"=$APIKEY; "Authorization"="Bearer $APIKEY" } \`
          -ContentType "application/json" | Out-Null
      }
      $since = (Get-Date).AddSeconds(-$INTERVAL)
    } catch { Write-Warning $_.Exception.Message }
    Start-Sleep -Seconds $INTERVAL
  }
}

# Run in background
Start-Job -Name PaperLANAgent -ScriptBlock $script -ArgumentList $INGEST,$KEY,$APIKEY,$INTERVAL | Out-Null
Write-Host "PaperLAN agent started. View with: Get-Job PaperLANAgent ; Receive-Job PaperLANAgent"`;

  const linuxCmd = `# PaperLAN Agent — Linux (run as root)
INGEST="${INGEST_URL}"
KEY="${enrollmentKey}"
APIKEY="${SUPABASE_ANON}"

sudo tee /usr/local/bin/paperlan-agent.sh > /dev/null <<'AGENT'
#!/usr/bin/env bash
INGEST="__INGEST__"
KEY="__KEY__"
APIKEY="__APIKEY__"
HOST=$(hostname)
IP=$(hostname -I 2>/dev/null | awk '{print $1}')
OS=$(. /etc/os-release 2>/dev/null && echo "$PRETTY_NAME" || uname -a)

ship() {
  local events_json="$1"
  local body
  body=$(jq -n --arg h "$HOST" --arg o "$OS" --arg ip "$IP" --argjson ev "$events_json" \\
    '{hostname:$h, os:$o, ip_address:$ip, agent_version:"paperlan-sh-1.0.0", events:$ev}')
  curl -sS -X POST "$INGEST" \\
    -H "content-type: application/json" \\
    -H "x-enrollment-key: $KEY" \\
    -H "apikey: $APIKEY" \\
    -H "authorization: Bearer $APIKEY" \\
    --data "$body" > /dev/null || true
}

journalctl -f -o json --no-pager 2>/dev/null | while read -r line; do
  msg=$(echo "$line" | jq -r '.MESSAGE // empty' 2>/dev/null)
  [ -z "$msg" ] && continue
  unit=$(echo "$line" | jq -r '._SYSTEMD_UNIT // .SYSLOG_IDENTIFIER // "journal"')
  prio=$(echo "$line" | jq -r '.PRIORITY // "6"')
  case "$prio" in
    0|1|2) level="critical" ;;
    3) level="error" ;;
    4) level="warning" ;;
    *) level="info" ;;
  esac
  ev=$(jq -cn --arg s "linux/$unit" --arg l "$level" --arg m "$msg" \\
        '[{source:$s, level:$l, message:$m}]')
  ship "$ev"
done
AGENT

sudo sed -i "s|__INGEST__|$INGEST|; s|__KEY__|$KEY|; s|__APIKEY__|$APIKEY|" /usr/local/bin/paperlan-agent.sh
sudo chmod +x /usr/local/bin/paperlan-agent.sh
sudo apt-get install -y jq curl 2>/dev/null || sudo yum install -y jq curl 2>/dev/null

sudo tee /etc/systemd/system/paperlan-agent.service > /dev/null <<'UNIT'
[Unit]
Description=PaperLAN Log Forwarder
After=network.target
[Service]
ExecStart=/usr/local/bin/paperlan-agent.sh
Restart=always
[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now paperlan-agent
sudo systemctl status paperlan-agent --no-pager`;

  const macosCmd = `# PaperLAN Agent — macOS (run with sudo)
INGEST="${INGEST_URL}"
KEY="${enrollmentKey}"
APIKEY="${SUPABASE_ANON}"

sudo tee /usr/local/bin/paperlan-agent.sh > /dev/null <<'AGENT'
#!/usr/bin/env bash
INGEST="__INGEST__"
KEY="__KEY__"
APIKEY="__APIKEY__"
HOST=$(scutil --get ComputerName 2>/dev/null || hostname)
IP=$(ipconfig getifaddr en0 2>/dev/null || echo "0.0.0.0")
OS="macOS $(sw_vers -productVersion)"

log stream --style ndjson --info 2>/dev/null | while read -r line; do
  msg=$(echo "$line" | /usr/bin/python3 -c "import sys,json;d=json.loads(sys.stdin.read());print(d.get('eventMessage',''))" 2>/dev/null)
  [ -z "$msg" ] && continue
  proc=$(echo "$line" | /usr/bin/python3 -c "import sys,json;d=json.loads(sys.stdin.read());print(d.get('processImagePath','macos'))" 2>/dev/null)
  body=$(/usr/bin/python3 -c "
import json,sys
print(json.dumps({
  'hostname':'$HOST','os':'$OS','ip_address':'$IP','agent_version':'paperlan-mac-1.0.0',
  'events':[{'source':'macos/'+'''$proc'''.split('/')[-1],'level':'info','message':'''$msg'''[:2000]}]
}))")
  curl -sS -X POST "$INGEST" \\
    -H "content-type: application/json" -H "x-enrollment-key: $KEY" \\
    -H "apikey: $APIKEY" -H "authorization: Bearer $APIKEY" \\
    --data "$body" > /dev/null || true
done
AGENT

sudo sed -i '' "s|__INGEST__|$INGEST|; s|__KEY__|$KEY|; s|__APIKEY__|$APIKEY|" /usr/local/bin/paperlan-agent.sh
sudo chmod +x /usr/local/bin/paperlan-agent.sh

sudo tee /Library/LaunchDaemons/io.paperlan.agent.plist > /dev/null <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>io.paperlan.agent</string>
  <key>ProgramArguments</key><array><string>/usr/local/bin/paperlan-agent.sh</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict></plist>
PLIST

sudo launchctl load /Library/LaunchDaemons/io.paperlan.agent.plist
echo "PaperLAN agent running."`;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Deploy Agent</h2>
          <p className="text-sm text-muted-foreground">
            Copy-paste a real script to start streaming logs from your endpoint
          </p>
        </div>
        <Badge variant="outline" className="ml-auto">Real ingestion endpoint</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border border-border rounded-lg bg-muted/30">
        <div className="space-y-2">
          <Label>Ingest Endpoint</Label>
          <Input value={INGEST_URL} readOnly className="font-mono text-xs" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="key">Enrollment Key</Label>
          {keys.length > 1 ? (
            <select
              value={enrollmentKey}
              onChange={(e) => setEnrollmentKey(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-background border border-input font-mono text-xs"
            >
              {keys.map((k) => (
                <option key={k.key} value={k.key}>{k.key} ({k.group_name})</option>
              ))}
            </select>
          ) : (
            <Input id="key" value={enrollmentKey} readOnly className="font-mono text-xs" />
          )}
        </div>
      </div>

      <div className="mb-4 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 flex gap-2">
        <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          These scripts ship real OS logs to your dashboard over HTTPS. Run as Administrator / root.
          Rotate the enrollment key before using in production.
        </p>
      </div>

      <Tabs defaultValue="windows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="windows" className="gap-2"><Monitor className="h-4 w-4" /> Windows</TabsTrigger>
          <TabsTrigger value="linux" className="gap-2"><Terminal className="h-4 w-4" /> Linux</TabsTrigger>
          <TabsTrigger value="macos" className="gap-2"><Apple className="h-4 w-4" /> macOS</TabsTrigger>
        </TabsList>

        <TabsContent value="windows" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Open PowerShell <strong>as Administrator</strong> and paste the entire block. Ships System, Application, and Security event logs every 30s.
          </p>
          <CodeBlock code={windowsCmd} />
        </TabsContent>

        <TabsContent value="linux" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Works on systemd distros (Ubuntu, Debian, RHEL, CentOS, Fedora). Streams journald events live.
          </p>
          <CodeBlock code={linuxCmd} />
        </TabsContent>

        <TabsContent value="macos" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Streams unified <code>log stream</code> events. macOS 12+.
          </p>
          <CodeBlock code={macosCmd} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
