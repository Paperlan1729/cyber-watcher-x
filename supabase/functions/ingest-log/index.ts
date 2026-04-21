// Ingest logs from PaperLAN agents (no JWT; uses enrollment key)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-enrollment-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface LogEvent {
  source: string;
  level?: string;
  message: string;
  raw?: unknown;
  event_time?: string;
}

interface IngestBody {
  hostname: string;
  os: string;
  ip_address?: string;
  agent_version?: string;
  events: LogEvent[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const key = req.headers.get("x-enrollment-key");
    if (!key) {
      return new Response(JSON.stringify({ error: "missing enrollment key" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: keyRow, error: keyErr } = await supabase
      .from("enrollment_keys")
      .select("id, revoked, group_name")
      .eq("key", key)
      .maybeSingle();

    if (keyErr || !keyRow || keyRow.revoked) {
      return new Response(JSON.stringify({ error: "invalid enrollment key" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as IngestBody;
    if (!body?.hostname || !body?.os || !Array.isArray(body?.events)) {
      return new Response(JSON.stringify({ error: "bad request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert agent by hostname
    const ip = body.ip_address || "0.0.0.0";
    const { data: existing } = await supabase
      .from("agents").select("id").eq("hostname", body.hostname).maybeSingle();

    let agentId = existing?.id;
    if (!agentId) {
      const { data: inserted, error: insErr } = await supabase
        .from("agents")
        .insert({
          hostname: body.hostname,
          os: body.os,
          ip_address: ip,
          agent_version: body.agent_version ?? null,
          status: "active",
          last_heartbeat: new Date().toISOString(),
          tags: [keyRow.group_name],
        })
        .select("id").single();
      if (insErr) throw insErr;
      agentId = inserted.id;
    } else {
      await supabase.from("agents").update({
        last_heartbeat: new Date().toISOString(),
        status: "active",
        agent_version: body.agent_version ?? null,
        ip_address: ip,
      }).eq("id", agentId);
    }

    // Insert events
    const rows = body.events.slice(0, 500).map((e) => ({
      agent_id: agentId,
      hostname: body.hostname,
      source: e.source ?? "unknown",
      level: (e.level ?? "info").toLowerCase(),
      message: (e.message ?? "").slice(0, 8000),
      raw: e.raw ?? null,
      event_time: e.event_time ?? new Date().toISOString(),
    }));

    if (rows.length > 0) {
      const { error: logErr } = await supabase.from("agent_logs").insert(rows);
      if (logErr) throw logErr;
    }

    return new Response(JSON.stringify({ ok: true, agent_id: agentId, ingested: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ingest-log error", e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
