import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askPharmaAI } from "@/lib/ai-chat.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/assistant")({ component: AssistantPage });

interface Msg { role: "user" | "assistant"; content: string }

const suggestions = [
  "Quelle est la posologie du Coartem pour un adulte ?",
  "Quels sont les effets secondaires de l'amoxicilline ?",
  "Comment traiter le paludisme simple chez l'enfant ?",
  "Interactions du métronidazole avec l'alcool ?",
];

function AssistantPage() {
  const ask = useServerFn(askPharmaAI);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await ask({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur");
      setMessages(next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" /> Assistant IA
        </h1>
        <p className="text-muted-foreground mt-1">Posez vos questions pharmaceutiques en français.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Bot className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg">Comment puis-je vous aider ?</h3>
              <p className="text-sm text-muted-foreground mt-1">Choisissez une suggestion ou tapez votre question.</p>
              <div className="mt-6 grid gap-2 w-full">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-left text-sm p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0"><Bot className="h-4 w-4" /></div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0"><User className="h-4 w-4" /></div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Bot className="h-4 w-4" /></div>
              <div className="bg-muted rounded-2xl px-4 py-3"><Loader2 className="h-4 w-4 animate-spin" /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t p-3 flex gap-2">
          <Input
            placeholder="Posez votre question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
