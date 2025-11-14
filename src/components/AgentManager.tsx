import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Shield, AlertTriangle, CheckCircle, XCircle, Network, Laptop, Server } from "lucide-react";

export interface Agent {
  id: string;
  hostname: string;
  ipv4: string;
  os: string;
  status: "online" | "offline" | "isolated" | "warning";
  healthScore: number;
  lastHeartbeat: Date;
  threatsDetected: number;
  logsSent: number;
  version: string;
  subnet: string;
}

interface AgentManagerProps {
  onIsolateAgent?: (agentId: string) => void;
  onUnIsolateAgent?: (agentId: string) => void;
  onCollectEvidence?: (agentId: string) => void;
}

export const AgentManager = ({ onIsolateAgent, onUnIsolateAgent, onCollectEvidence }: AgentManagerProps) => {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "agent-001",
      hostname: "WORKSTATION-01",
      ipv4: "192.168.10.15",
      os: "Windows 11 Pro",
      status: "online",
      healthScore: 95,
      lastHeartbeat: new Date(),
      threatsDetected: 0,
      logsSent: 15420,
      version: "v4.5.2",
      subnet: "192.168.10.0/24"
    },
    {
      id: "agent-002",
      hostname: "SERVER-DC01",
      ipv4: "192.168.10.10",
      os: "Windows Server 2022",
      status: "warning",
      healthScore: 72,
      lastHeartbeat: new Date(),
      threatsDetected: 3,
      logsSent: 28910,
      version: "v4.5.2",
      subnet: "192.168.10.0/24"
    },
    {
      id: "agent-003",
      hostname: "WEB-SERVER-01",
      ipv4: "192.168.20.50",
      os: "Ubuntu 22.04 LTS",
      status: "isolated",
      healthScore: 45,
      lastHeartbeat: new Date(Date.now() - 120000),
      threatsDetected: 7,
      logsSent: 42150,
      version: "v4.5.1",
      subnet: "192.168.20.0/24"
    },
    {
      id: "agent-004",
      hostname: "LAPTOP-DEV-05",
      ipv4: "192.168.10.88",
      os: "macOS Sonoma",
      status: "online",
      healthScore: 98,
      lastHeartbeat: new Date(),
      threatsDetected: 0,
      logsSent: 8920,
      version: "v4.5.2",
      subnet: "192.168.10.0/24"
    },
    {
      id: "agent-005",
      hostname: "DB-SERVER-02",
      ipv4: "192.168.30.25",
      os: "CentOS 8",
      status: "offline",
      healthScore: 0,
      lastHeartbeat: new Date(Date.now() - 600000),
      threatsDetected: 0,
      logsSent: 18200,
      version: "v4.4.9",
      subnet: "192.168.30.0/24"
    }
  ]);

  const getStatusIcon = (status: Agent["status"]) => {
    switch (status) {
      case "online": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "isolated": return <XCircle className="h-4 w-4 text-red-500" />;
      case "offline": return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Agent["status"]) => {
    const variants: Record<Agent["status"], string> = {
      online: "bg-green-500/10 text-green-500 border-green-500/20",
      warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      isolated: "bg-red-500/10 text-red-500 border-red-500/20",
      offline: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20"
    };
    return variants[status];
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const handleIsolate = (agentId: string) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, status: "isolated" as const } : a
    ));
    onIsolateAgent?.(agentId);
  };

  const handleUnIsolate = (agentId: string) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, status: "online" as const } : a
    ));
    onUnIsolateAgent?.(agentId);
  };

  const groupBySubnet = () => {
    const subnets = new Map<string, Agent[]>();
    agents.forEach(agent => {
      const subnet = agent.subnet;
      if (!subnets.has(subnet)) subnets.set(subnet, []);
      subnets.get(subnet)!.push(agent);
    });
    return subnets;
  };

  const subnets = groupBySubnet();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Network className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Agent Manager</h2>
          <p className="text-sm text-muted-foreground">Multi-Device IPv4 Monitoring & Control</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Agents ({agents.length})</TabsTrigger>
          <TabsTrigger value="online">Online ({agents.filter(a => a.status === "online").length})</TabsTrigger>
          <TabsTrigger value="isolated">Isolated ({agents.filter(a => a.status === "isolated").length})</TabsTrigger>
          <TabsTrigger value="subnets">By Subnet ({subnets.size})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {agents.map(agent => (
            <div key={agent.id} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(agent.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{agent.hostname}</h3>
                      <Badge variant="outline" className={getStatusBadge(agent.status)}>
                        {agent.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <span className="font-mono">{agent.ipv4}</span>
                      <span>•</span>
                      <span>{agent.os}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getHealthColor(agent.healthScore)}`}>
                    {agent.healthScore}%
                  </p>
                  <p className="text-xs text-muted-foreground">Health Score</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Threats</p>
                  <p className="font-semibold text-foreground">{agent.threatsDetected}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Logs Sent</p>
                  <p className="font-semibold text-foreground">{agent.logsSent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Version</p>
                  <p className="font-semibold text-foreground">{agent.version}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Heartbeat</p>
                  <p className="font-semibold text-foreground">
                    {Math.round((Date.now() - agent.lastHeartbeat.getTime()) / 1000)}s ago
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {agent.status === "isolated" ? (
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
                    disabled={agent.status === "offline"}
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
                  disabled={agent.status === "offline"}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Collect Evidence
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="online" className="space-y-4">
          {agents.filter(a => a.status === "online").map(agent => (
            <div key={agent.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <h3 className="font-semibold text-foreground">{agent.hostname}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{agent.ipv4}</p>
                </div>
                <div className="ml-auto">
                  <span className={`text-xl font-bold ${getHealthColor(agent.healthScore)}`}>
                    {agent.healthScore}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="isolated" className="space-y-4">
          {agents.filter(a => a.status === "isolated").map(agent => (
            <div key={agent.id} className="border border-red-500/20 bg-red-500/5 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-foreground">{agent.hostname}</h3>
                    <p className="text-sm text-muted-foreground font-mono">{agent.ipv4}</p>
                    <p className="text-sm text-red-500 mt-1">⚠️ Device is quarantined from network</p>
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
                  <h3 className="font-semibold text-foreground">{subnet}</h3>
                </div>
                <Badge variant="outline">{subnetAgents.length} devices</Badge>
              </div>
              <div className="space-y-2">
                {subnetAgents.map(agent => (
                  <div key={agent.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(agent.status)}
                      <span className="font-mono text-foreground">{agent.ipv4}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-foreground">{agent.hostname}</span>
                    </div>
                    <span className={`font-semibold ${getHealthColor(agent.healthScore)}`}>
                      {agent.healthScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
