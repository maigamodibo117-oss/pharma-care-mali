import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

interface ChatMessage { role: "user" | "assistant" | "system"; content: string }

export const askPharmaAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { messages: ChatMessage[] }) => d)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY manquante");

    const system: ChatMessage = {
      role: "system",
      content:
        "Tu es un assistant pharmaceutique expert qui aide les pharmaciens au Mali. " +
        "Réponds toujours en français de manière claire, professionnelle et concise. " +
        "Donne des informations sur les médicaments (posologie, indications, contre-indications, interactions), " +
        "les pathologies courantes au Mali (paludisme, infections respiratoires, diarrhées, etc.), " +
        "et les bonnes pratiques pharmaceutiques. " +
        "Précise toujours que tes conseils ne remplacent pas l'avis d'un médecin.",
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [system, ...data.messages],
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`AI Gateway: ${res.status} ${txt}`);
    }
    const json = await res.json();
    return { reply: json.choices?.[0]?.message?.content ?? "" };
  });
