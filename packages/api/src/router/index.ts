import { router } from "../trpc";
import { postRouter } from "./post";
import { authRouter } from "./auth";
import { pinRouter } from "./pin";

export const appRouter = router({
  post: postRouter,
  pin: pinRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
