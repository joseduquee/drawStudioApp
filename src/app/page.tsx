"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Separator } from "@/src/components/ui/separator";
import { Badge } from "@/src/components/ui/badge";
import { Sparkles, FolderOpen, Plus, History, Loader2 } from "lucide-react";

type RecentIds = string[];
const RECENT_KEY = "tldraw_recent_ids";

export default function Home() {
  const router = useRouter();
  const [docId, setDocId] = useState("");
  const [recent, setRecent] = useState<RecentIds>([]);
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<null | "create" | "open">(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw) as RecentIds);
    } catch {}
  }, []);

  useEffect(() => {
    router.prefetch("/editor?id=__prefetch__");
  }, [router]);

  const addRecent = (id: string) => {
    try {
      const next = [id, ...recent.filter((x) => x !== id)].slice(0, 6);
      setRecent(next);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  };

  const createNew = () => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    addRecent(id);
    setAction("create");
    startTransition(() => {
      router.push(`/editor?id=${id}`);
    });
  };

  const openExisting = () => {
    const id = docId.trim();
    if (!id) return;
    addRecent(id);
    setAction("open");
    startTransition(() => {
      router.push(`/editor?id=${encodeURIComponent(id)}`);
    });
  };

  const canOpen = useMemo(() => docId.trim().length > 0, [docId]);

  const creating = isPending && action === "create";
  const opening = isPending && action === "open";

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_80%_-20%,hsl(220_90%_60%_/_0.35),transparent),radial-gradient(900px_500px_at_0%_120%,hsl(280_90%_60%_/_0.25),transparent)]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-background" />

      <main
        className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center p-6"
        aria-busy={isPending}
        aria-live="polite"
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              DrawStudio para prueba tecnica 
            </h1>
            <p className="text-muted-foreground">
              Crea, abre y comparte tus lienzos con un click.
            </p>
          </div>
        </div>

        <Card className="w-full backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border/40 shadow-xl">
          <div className="grid gap-6 p-6 sm:grid-cols-12 sm:p-8">
            <section className="sm:col-span-6 space-y-4">
              <h2 className="text-lg font-medium">Comenzar</h2>
              <p className="text-sm text-muted-foreground">
                Puedes crear un documento nuevo o abrir uno existente con su ID.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  onClick={createNew}
                  className="cursor-pointer group"
                  size="sm"
                  disabled={isPending}
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Plus className="transition-transform group-hover:rotate-90" />
                      Crea un lienzo
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Ingresa Id del lienzo…"
                    value={docId}
                    onChange={(e) => setDocId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canOpen && !isPending) openExisting();
                    }}
                    className="sm:w-64"
                  />
                  <Button
                    variant="secondary"
                    onClick={openExisting}
                    disabled={!canOpen || isPending}
                    className="cursor-pointer"
                    size="sm"
                  >
                    {opening ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cargando…
                      </>
                    ) : (
                      <>
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Abrir
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </section>

            <div className="sm:hidden">
              <Separator className="my-2" />
            </div>

            <section className="sm:col-span-6 space-y-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-lg font-medium">Recientes</h2>
              </div>

              {recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aún no hay documentos recientes. Crea uno nuevo o abre por ID.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {recent.map((id) => (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="cursor-pointer select-none transition hover:scale-[1.02] hover:bg-secondary/80"
                      onClick={() =>
                        !isPending &&
                        router.push(`/editor?id=${encodeURIComponent(id)}`)
                      }
                      title="Abrir este documento"
                    >
                      {id}
                    </Badge>
                  ))}
                </div>
              )}
            </section>
          </div>

          <Separator />

          <div className="flex flex-col items-center justify-between gap-3 p-6 text-sm text-muted-foreground sm:flex-row">
            <span>
              Construido para prueba tecnica de Vidext por Alexander Duque con <span className="font-medium">Next.js</span>,{" "}
              <span className="font-medium">tRPC</span>,{" "}
              <span className="font-medium">Tailwind</span> y{" "}
              <span className="font-medium">shadcn/ui</span>.
            </span>
          </div>
        </Card>

        {isPending && (
          <div className="pointer-events-none fixed inset-0 grid place-items-center bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando editor…
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
