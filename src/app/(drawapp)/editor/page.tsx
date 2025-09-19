'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { trpc } from '@/src/lib/trpc/react';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Separator } from '@/src/components/ui/separator';
import { Input } from '@/src/components/ui/input';

import { Tldraw, Editor as TLEditor, createShapeId } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Loader2, CheckCircle } from 'lucide-react';

function useDebounced<T extends (...a: any[]) => void>(fn: T, delay = 800) {
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  return (...args: Parameters<T>) => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => fn(...args), delay);
  };
}

type AnyRecord = Record<string, any>;

export default function EditorPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? 'default';

  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const genMutation = trpc.editor.generateShape.useMutation({
    onSuccess: (shapeFromServer) => {
      const editor = editorRef.current as any;
      if (!editor) return;

      const newId = createShapeId();
      const type = shapeFromServer?.type ?? 'geo';
      const x =
        typeof shapeFromServer?.x === 'number' ? shapeFromServer.x : 120;
      const y =
        typeof shapeFromServer?.y === 'number' ? shapeFromServer.y : 120;
      const props = {
        geo: shapeFromServer?.props?.geo ?? 'rectangle',
        w: shapeFromServer?.props?.w ?? 100,
        h: shapeFromServer?.props?.h ?? 100,
        color: shapeFromServer?.props?.color ?? 'blue',
      };

      editor.createShape({ id: newId, type, x, y, props });
      editor.setSelectedShapes?.([newId]);
    },
  });

  const refineMutation = trpc.editor.refineDrawing.useMutation({
    onSuccess: (refined) => {
      const editor = editorRef.current as any;
      if (!editor) return;

      const current = editor.getCurrentPageShapes?.() ?? [];
      const byId: Record<string, any> = {};
      for (const s of (refined as any[]) ?? []) if (s?.id) byId[s.id] = s;

      const updates = current
        .filter((s: any) => byId[s.id]?.props)
        .map((s: any) => ({
          id: s.id,
          type: s.type,
          props: byId[s.id].props,
        }));

      if (updates.length) editor.updateShapes?.(updates);
    },
  });

  const handleGenerate = () => {
    const p = aiPrompt.trim();
    if (!p) return;
    genMutation.mutate({ prompt: p });
    setAiPrompt('');
  };

  const { data: snapshot, isLoading } = trpc.editor.get.useQuery({ id });

  const saveMutation = trpc.editor.save.useMutation();
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle'
  );

  const debouncedSave = useDebounced((snap: unknown) => {
    setSaving('saving');
    saveMutation.mutate(
      { id, store: snap },
      {
        onSuccess: () => setSaving('saved'),
        onError: () => setSaving('error'),
      }
    );
  }, 700);

  useEffect(() => {
    const currentId = searchParams.get('id') ?? 'default';
    try {
      localStorage.setItem('last_editor_id', currentId);
    } catch {}
  }, [searchParams]);

  const editorRef = useRef<TLEditor | null>(null);
  const appliedForIdRef = useRef<string | null>(null);

  const applySnapshot = (editor: TLEditor, snap: any) => {
    if (!snap) return;
    const store: any = (editor as any).store;
    try {
      if (typeof store.loadSnapshot === 'function') {
        store.loadSnapshot(snap);
      } else if (typeof store.put === 'function') {
        const records: AnyRecord[] = Array.isArray(snap)
          ? snap
          : typeof snap === 'object'
          ? Object.values(snap as Record<string, AnyRecord>)
          : [];
        if (records.length) store.put(records);
      }
    } catch (err) {
      console.warn('Could not apply snapshot:', err);
    }
  };

  const handleMount = (editor: TLEditor) => {
    editorRef.current = editor;
    const store: any = (editor as any).store;

    const unsub = store.listen(
      () => {
        try {
          const snap = store.serialize();
          debouncedSave(snap);
        } catch (err) {
          console.warn('Could not serialize store:', err);
        }
      },
      { source: 'user' }
    );

    if (snapshot && appliedForIdRef.current !== id) {
      requestAnimationFrame(() => {
        applySnapshot(editor, snapshot);
        appliedForIdRef.current = id;
      });
    }

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !snapshot) return;
    if (appliedForIdRef.current === id) return;
    applySnapshot(editor, snapshot);
    appliedForIdRef.current = id;
  }, [snapshot, id]);

  const modifySelectedShape = () => {
    const editor = editorRef.current as any;
    if (!editor) return;
    const selected = editor.getSelectedShapes?.() ?? [];

    if (!selected.length) {
      editor.createShape?.({
        type: 'geo',
        x: 120,
        y: 120,
        props: { geo: 'rectangle', color: 'blue' },
      });
      return;
    }

    const first = selected[0];
    try {
      editor.updateShapes?.([
        { id: first.id, type: first.type, props: { color: 'red' } },
      ]);
    } catch {
      editor.updateShapes?.([
        {
          id: first.id,
          type: first.type,
          x: (first as any).x + 20,
          y: (first as any).y + 20,
        },
      ]);
    }
  };

  return (
    <div className='w-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
      <motion.div
        initial={isClient ? { y: -16, opacity: 0 } : { y: 0, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        className='h-16 border-b bg-white/70 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shadow-sm'
      >
        <div className='flex items-center gap-3'>
          <div className='h-9 w-9 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20'>
            <Sparkles className='h-4 w-4 text-primary' />
          </div>
          <div className='leading-tight'>
            <h1 className='text-lg font-semibold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent'>
              DrawStudio · AI
            </h1>
            <p className='text-[11px] text-muted-foreground'>
              ID: <span className='font-mono'>{id}</span>
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowAiPanel((v) => !v)}
            className='cursor-pointer'
          >
            <Sparkles className='h-4 w-4 mr-2' />
            AI Tools
          </Button>
          <Button
            size='sm'
            onClick={modifySelectedShape}
            className='cursor-pointer'
          >
            <Wand2 className='h-4 w-4 mr-2' />
            Modify Shape
          </Button>

          <AnimatePresence mode='wait' initial={false}>
            {saving === 'saving' ? (
              <motion.div
                key='saving'
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className='flex items-center gap-1.5 text-xs text-amber-600'
              >
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
                Guardando…
              </motion.div>
            ) : saving === 'saved' ? (
              <motion.div
                key='saved'
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className='flex items-center gap-1.5 text-xs text-emerald-600'
              >
                <CheckCircle className='h-3.5 w-3.5' />
                Auto-guardado
              </motion.div>
            ) : saving === 'error' ? (
              <motion.div
                key='error'
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className='text-xs text-rose-600'
              >
                Error
              </motion.div>
            ) : (
              <motion.div
                key='idle'
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className='text-xs text-muted-foreground'
              >
                Listo
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className='flex-1 flex relative'>
        <AnimatePresence>
          {showAiPanel && (
            <motion.aside
              initial={
                isClient ? { x: -320, opacity: 0 } : { x: 0, opacity: 1 }
              }
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              className='w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-r shadow-lg'
            >
              <Card className='border-0 rounded-none h-full'>
                <div className='p-4 border-b'>
                  <h3 className='font-medium flex items-center gap-2'>
                    <Sparkles className='h-4 w-4 text-purple-600' />
                    AI Tools
                  </h3>
                  <p className='text-xs text-muted-foreground'>
                    Genera figuras por texto o refina el dibujo actual.
                  </p>
                </div>

                <div className='p-4 space-y-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>
                      Generar figura a partir de un prompt
                    </label>
                    <div className='flex gap-2'>
                      <Input
                        placeholder='ej: cuadrado azul…'
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        className='flex-1'
                      />
                      <Button
                        onClick={handleGenerate}
                        disabled={genMutation.isPending}
                        size='sm'
                        className='cursor-pointer'
                      >
                        {genMutation.isPending ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Sparkles className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                    <p className='text-[11px] text-muted-foreground'>
                      Prueba con alguna figura y color
                    </p>
                  </div>
                  <Separator />
                </div>
              </Card>
            </motion.aside>
          )}
        </AnimatePresence>

        <div className='flex-1 min-h-0 relative'>
          <AnimatePresence>
            {(genMutation.isPending || refineMutation.isPending) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='absolute inset-0 z-10 bg-background/40 backdrop-blur-[2px] flex items-center justify-center'
              >
                <div className='px-3 py-2 rounded-md bg-white/80 dark:bg-slate-900/80 shadow border flex items-center gap-2 text-sm'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  {genMutation.isPending ? 'Generating…' : 'Refining…'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div className='h-full w-full animate-pulse bg-muted' />
          ) : (
            <div
              className='h-[82vh] md:h-[78vh] lg:h-[74vh] w-full'
              style={{ touchAction: 'none' }}
            >
              <Tldraw onMount={handleMount} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
