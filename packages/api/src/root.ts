import { authRouter } from "./router/auth";
import { commentRouter } from "./router/comment";
import { communityRouter } from "./router/community";
import { pinRouter } from "./router/pin";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  pin: pinRouter,
  comment: commentRouter,
  community: communityRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
