import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { task, workflow_steps } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const stepsText = workflow_steps?.length
      ? `\n\nWorkflow steps:\n${workflow_steps.map((s: any, i: number) => `${i + 1}. [${s.node_type}] ${s.node_name} (${s.tool}): ${s.description}`).join("\n")}`
      : "";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: `You are an n8n workflow automation expert. Given a task description and optional workflow steps, generate a detailed n8n workflow description including which n8n nodes to use, how to configure them, and how to connect them. Be specific about node types (e.g. HTTP Request, Google Sheets, IF, Code), credentials needed, and data transformations. Format it as a clear step-by-step guide. Return ONLY the workflow guide, no extra explanation.\n\nTask: ${task}${stepsText}`,
            }],
          }],
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("Gemini API error:", response.status, t);
      throw new Error("Gemini API error");
    }

    const data = await response.json();
    const workflow = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    return new Response(JSON.stringify({ workflow }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-n8n-workflow error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
