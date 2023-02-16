import { authRouter } from "./router/auth";
import { communityRouter } from "./router/community";
import { pinRouter } from "./router/pin";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  pin: pinRouter,
  community: communityRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
