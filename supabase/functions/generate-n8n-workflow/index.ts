import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://runtime.codewords.ai";
const WORKFLOW_ID = "generate_n8n_workflow_302b1af5";
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 40; // ~2 minutes max

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { task, workflow_steps, selected_tools } = await req.json();
    const apiKey = Deno.env.get("CODEWORDS_API_KEY");

    const steps = (workflow_steps || []).map((s: any) =>
      typeof s === "string" ? s : `[${s.node_type}] ${s.node_name} (${s.tool}): ${s.description}`
    );

    // 1. Start async execution
    const startRes = await fetch(`${BASE_URL}/run_async/${WORKFLOW_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        task_description: task,
        workflow_steps: steps,
        selected_tools: selected_tools || [],
      }),
    });

    if (!startRes.ok) {
      const errText = await startRes.text();
      console.error("run_async error:", startRes.status, errText);
      return new Response(
        JSON.stringify({ error: `Failed to start generation: ${startRes.status}` }),
        { status: startRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { request_id } = await startRes.json();
    if (!request_id) {
      return new Response(
        JSON.stringify({ error: "No request_id returned from API" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Poll for result
    for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      const pollRes = await fetch(`${BASE_URL}/result/${request_id}`, {
        headers: { "Authorization": `Bearer ${apiKey}` },
      });

      if (pollRes.status === 202) {
        // Still processing
        continue;
      }

      if (pollRes.ok) {
        const data = await pollRes.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const errText = await pollRes.text();
      console.error("poll error:", pollRes.status, errText);
      return new Response(
        JSON.stringify({ error: `Poll failed: ${pollRes.status}` }),
        { status: pollRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Generation timed out after polling" }),
      { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-n8n-workflow error:", e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
