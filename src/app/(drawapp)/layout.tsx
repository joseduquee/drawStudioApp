"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Separator } from "@/src/components/ui/separator";
import {
  TooltipProvider,
} from "@/src/components/ui/tooltip";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { cn } from "@/src/lib/utils";
import {
  Menu,
  Home,
  BookOpen,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const links = [
  { name: "home", href: "/", icon: Home },
  { name: "docs", href: "/docs", icon: BookOpen },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [lastEditorId, setLastEditorId] = useState<string | null>(null)
  const [query, setQuery] = useState("");
  useEffect(() => {
    try {
      const v = localStorage.getItem("last_editor_id")
      if (v) setLastEditorId(v)
    } catch {}
  }, [pathname])
  const editorHref = lastEditorId
  ? `/editor?id=${encodeURIComponent(lastEditorId)}`
  : "/editor";
  const editorActive = pathname.startsWith("/editor");
  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="mt-2 space-y-1">
      {links.map(({ name, href, icon: Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
              active
                ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
            <span className="capitalize">{name}</span>
            {active && <ChevronRight className="ml-auto h-4 w-4 opacity-70" />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/30">

        <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">

            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="px-4 py-3">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    DrawStudio
                  </SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-4">
                  <Separator />
                  <div className="py-3">
                    <Input
                      placeholder="Search…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <NavLinks onNavigate={() => { /* auto-close handled by Sheet */ }} />
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="group flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <Sparkles className="h-4 w-4 text-primary transition group-hover:rotate-6" />
              </div>
              <span className="font-semibold tracking-tight">DrawStudio</span>
            </Link>

            <div className="ml-auto flex items-center gap-1">
              <Avatar className="h-8 w-8 ring-1 ring-border">
                <AvatarImage alt="User" />
                <AvatarFallback className="text-[11px]">AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 pb-6 pt-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] lg:block">
            <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
              <div className="p-3">
                <div className="flex items-center justify-between px-1 pb-2">
                  <span className="text-xs font-medium text-muted-foreground">Navegación</span>
                </div>
                <NavLinks />
              </div>

              <Separator />
              <div className="p-3">
                <span className="mb-2 block text-xs font-medium text-muted-foreground">
                  Acciones rapidas
                </span>
                  <div className="grid grid-cols-2 gap-2">

    <Button
      asChild
      size="sm"
      variant={editorActive ? "default" : "outline"}
      className={editorActive ? "ring-1 ring-primary/30" : ""}
    >
      <Link href={editorHref}>Editor</Link>
    </Button>

    <Button
      asChild
      size="sm"
      variant={pathname.startsWith("/docs") ? "default" : "outline"}
      className={pathname.startsWith("/docs") ? "ring-1 ring-primary/30" : ""}
    >
      <Link href="/docs">README</Link>
    </Button>
  </div>
              </div>
            </div>
          </aside>

          <main className="min-h-[calc(100vh-5rem)]">
            <div className="rounded-2xl border bg-background shadow-sm">
              <div className="p-4 sm:p-6">{children}</div>
            </div>

            <footer className="mt-6 text-center text-sm text-muted-foreground">
              Technical test by <span className="font-medium">Alexander Duque</span>
            </footer>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
