import { router } from "../trpc";
import { editorRouter } from "./editor";

export const appRouter = router({
  editor: editorRouter,
});

export type AppRouter = typeof appRouter;
