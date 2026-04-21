import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Network,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Agent {
  id: string;
  hostname: string;
  ip_address: string;
  os: string;
  status: string;
  last_heartbeat: string | null;
  agent_version: string | null;
  subnet: string | null;
  tags: string[] | null;
}

type UiStatus = "online" | "offline" | "isolated" | "warning";

interface AgentManagerProps {
  onIsolateAgent?: (agentId: string) => void;
  onUnIsolateAgent?: (agentId: string) => void;
  onCollectEvidence?: (agentId: string) => void;
}

const deriveUiStatus = (a: Agent): UiStatus => {
  if (a.status === "isolated") return "isolated";
  if (!a.last_heartbeat) return "offline";
  const age = Date.now() - new Date(a.last_heartbeat).getTime();
  if (age > 5 * 60 * 1000) return "offline";
  if (age > 60 * 1000 || a.status === "warning") return "warning";
  return "online";
};

const computeHealth = (a: Agent, ui: UiStatus): number => {
  if (ui === "offline") return 0;
  if (ui === "isolated") return 40;
  if (ui === "warning") return 70;
  return 95;
};

export const AgentManager = ({
  onIsolateAgent,
  onUnIsolateAgent,
  onCollectEvidence,
}: AgentManagerProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from("agents")
      .select("id, hostname, ip_address, os, status, last_heartbeat, agent_version, subnet, tags")
      .order("hostname", { ascending: true });
    if (error) {
      toast.error("Failed to load agents", { description: error.message });
    } else {
      setAgents((data as any) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
    const channel = supabase
      .channel("agents-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agents" },
        () => fetchAgents()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusIcon = (status: UiStatus) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "isolated":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "offline":
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: UiStatus) => {
    const variants: Record<UiStatus, string> = {
      online: "bg-green-500/10 text-green-500 border-green-500/20",
      warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      isolated: "bg-red-500/10 text-red-500 border-red-500/20",
      offline:
        "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
    };
    return variants[status];
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const updateStatus = async (agentId: string, status: string) => {
    const { error } = await supabase
      .from("agents")
      .update({ status })
      .eq("id", agentId);
    if (error) toast.error("Update failed", { description: error.message });
  };

  const handleIsolate = async (agentId: string) => {
    await updateStatus(agentId, "isolated");
    onIsolateAgent?.(agentId);
  };

  const handleUnIsolate = async (agentId: string) => {
    await updateStatus(agentId, "active");
    onUnIsolateAgent?.(agentId);
  };

  const enriched = useMemo(
    () =>
      agents.map((a) => {
        const ui = deriveUiStatus(a);
        return { agent: a, ui, health: computeHealth(a, ui) };
      }),
    [agents]
  );

  const subnets = useMemo(() => {
    const map = new Map<string, typeof enriched>();
    enriched.forEach((e) => {
      const key = e.agent.subnet ?? "unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [enriched]);

  const onlineCount = enriched.filter((e) => e.ui === "online").length;
  const isolatedCount = enriched.filter((e) => e.ui === "isolated").length;

  const formatHeartbeat = (hb: string | null) => {
    if (!hb) return "never";
    const s = Math.round((Date.now() - new Date(hb).getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.round(s / 60)}m ago`;
    return `${Math.round(s / 3600)}h ago`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Network className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground">Agent Manager</h2>
          <p className="text-sm text-muted-foreground">
            Live endpoint inventory from your PaperLAN backend
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAgents}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading agents…</div>
      ) : enriched.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-3 text-center">
          <div className="p-3 rounded-full bg-muted">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No agents enrolled yet</p>
            <p className="text-sm text-muted-foreground">
              Use the <span className="font-medium">Deploy Agent</span> panel below to
              enroll your first endpoint.
            </p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Agents ({enriched.length})</TabsTrigger>
            <TabsTrigger value="online">Online ({onlineCount})</TabsTrigger>
            <TabsTrigger value="isolated">Isolated ({isolatedCount})</TabsTrigger>
            <TabsTrigger value="subnets">By Subnet ({subnets.size})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {enriched.map(({ agent, ui, health }) => (
              <div
                key={agent.id}
                className="border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(ui)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {agent.hostname}
                        </h3>
                        <Badge variant="outline" className={getStatusBadge(ui)}>
                          {ui.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <span className="font-mono">{agent.ip_address}</span>
                        <span>•</span>
                        <span>{agent.os}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getHealthColor(health)}`}>
                      {health}%
                    </p>
                    <p className="text-xs text-muted-foreground">Health Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Version</p>
                    <p className="font-semibold text-foreground">
                      {agent.agent_version ?? "unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Subnet</p>
                    <p className="font-semibold text-foreground font-mono">
                      {agent.subnet ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Heartbeat</p>
                    <p className="font-semibold text-foreground">
                      {formatHeartbeat(agent.last_heartbeat)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {ui === "isolated" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnIsolate(agent.id)}
                      className="text-green-500 border-green-500/20 hover:bg-green-500/10"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Un-Isolate Device
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleIsolate(agent.id)}
                      disabled={ui === "offline"}
                      className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Isolate Device
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCollectEvidence?.(agent.id)}
                    disabled={ui === "offline"}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Collect Evidence
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="online" className="space-y-4">
            {enriched
              .filter((e) => e.ui === "online")
              .map(({ agent, health }) => (
                <div
                  key={agent.id}
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {agent.hostname}
                      </h3>
                      <p className="text-sm text-muted-foreground font-mono">
                        {agent.ip_address}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span
                        className={`text-xl font-bold ${getHealthColor(health)}`}
                      >
                        {health}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </TabsContent>

          <TabsContent value="isolated" className="space-y-4">
            {enriched
              .filter((e) => e.ui === "isolated")
              .map(({ agent }) => (
                <div
                  key={agent.id}
                  className="border border-red-500/20 bg-red-500/5 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {agent.hostname}
                        </h3>
                        <p className="text-sm text-muted-foreground font-mono">
                          {agent.ip_address}
                        </p>
                        <p className="text-sm text-red-500 mt-1">
                          ⚠️ Device is quarantined from network
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnIsolate(agent.id)}
                      className="text-green-500 border-green-500/20 hover:bg-green-500/10"
                    >
                      Restore Access
                    </Button>
                  </div>
                </div>
              ))}
          </TabsContent>

          <TabsContent value="subnets" className="space-y-4">
            {Array.from(subnets.entries()).map(([subnet, subnetAgents]) => (
              <div key={subnet} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground font-mono">
                      {subnet}
                    </h3>
                  </div>
                  <Badge variant="outline">{subnetAgents.length} devices</Badge>
                </div>
                <div className="space-y-2">
                  {subnetAgents.map(({ agent, ui, health }) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ui)}
                        <span className="font-mono text-foreground">
                          {agent.ip_address}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-foreground">{agent.hostname}</span>
                      </div>
                      <span className={`font-semibold ${getHealthColor(health)}`}>
                        {health}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
};
