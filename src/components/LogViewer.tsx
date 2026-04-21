import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollText, RefreshCw, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LogRow {
  id: string;
  hostname: string;
  source: string;
  level: string;
  message: string;
  event_time: string;
}

const levelClass = (level: string) => {
  switch (level) {
    case "error":
    case "critical":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "warn":
    case "warning":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "info":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export const LogViewer = () => {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("agent_logs")
      .select("id, hostname, source, level, message, event_time")
      .order("event_time", { ascending: false })
      .limit(200);
    if (error) toast.error("Failed to load logs", { description: error.message });
    else setLogs((data as LogRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    const channel = supabase
      .channel("agent-logs-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "agent_logs" },
        (payload) => {
          setLogs((prev) => [payload.new as LogRow, ...prev].slice(0, 200));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <ScrollText className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground">Live Endpoint Logs</h2>
          <p className="text-sm text-muted-foreground">
            Streaming from enrolled agents in real time
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Loading logs…</div>
      ) : logs.length === 0 ? (
        <div className="py-8 flex flex-col items-center gap-2 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No logs yet. Deploy an agent below to start streaming events.
          </p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[500px] overflow-y-auto font-mono text-xs">
          {logs.map((l) => (
            <div
              key={l.id}
              className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 border-b border-border/40"
            >
              <span className="text-muted-foreground shrink-0 w-32">
                {new Date(l.event_time).toLocaleTimeString()}
              </span>
              <Badge variant="outline" className={`${levelClass(l.level)} shrink-0`}>
                {l.level.toUpperCase()}
              </Badge>
              <span className="text-primary shrink-0 w-32 truncate">{l.hostname}</span>
              <span className="text-muted-foreground shrink-0 w-24 truncate">
                {l.source}
              </span>
              <span className="text-foreground break-all">{l.message}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
