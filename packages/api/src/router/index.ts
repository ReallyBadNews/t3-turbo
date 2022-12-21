import { router } from "../trpc";
import { authRouter } from "./auth";
import { communityRouter } from "./community";
import { pinRouter } from "./pin";

export const appRouter = router({
  pin: pinRouter,
  community: communityRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
