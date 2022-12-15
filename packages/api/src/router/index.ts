import { router } from "../trpc";
import { authRouter } from "./auth";
import { pinRouter } from "./pin";

export const appRouter = router({
  pin: pinRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
