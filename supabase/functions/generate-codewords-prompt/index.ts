import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const API_URL =
  "https://runtime.codewords.ai/run/generate_codewords_prompt_fdbdf72c";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { task, workflow_steps } = await req.json();
    const apiKey = Deno.env.get("CODEWORDS_API_KEY");

    // API expects workflow_steps as string[]
    const steps = (workflow_steps || []).map((s: any) =>
      typeof s === "string" ? s : `[${s.node_type}] ${s.node_name} (${s.tool}): ${s.description}`
    );

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey!,
      },
      body: JSON.stringify({ task_description: task, workflow_steps: steps }),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-codewords-prompt error:", e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
