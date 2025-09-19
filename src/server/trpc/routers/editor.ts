import { initTRPC } from "@trpc/server";
import { z } from "zod";
import superjson from "superjson";
import { readById, writeById } from "../../db/persistence";
import { generateShapeFromText, refineDrawing } from "../../ia/openai";

const t = initTRPC.create({ transformer: superjson });

export const editorRouter = t.router({
  get: t.procedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const store = await readById(input.id);
      return store ?? null;
    }),

  save: t.procedure
    .input(
      z.object({
        id: z.string().min(1),
        store: z.unknown(),
      })
    )
    .mutation(async ({ input }) => {
      await writeById(input.id, input.store);
      return { ok: true } as const;
    }),

  generateShape: t.procedure
    .input(z.object({ prompt: z.string().min(1).max(100) }))
    .mutation(async ({ input }) => {
      const shape = await generateShapeFromText(input.prompt);
      return shape;
    }),

  refineDrawing: t.procedure
    .input(z.object({ shapes: z.array(z.unknown()) }))
    .mutation(async ({ input }) => {
      const refined = await refineDrawing(input.shapes);
      return refined;
    }),
});

export type EditorRouter = typeof editorRouter;
