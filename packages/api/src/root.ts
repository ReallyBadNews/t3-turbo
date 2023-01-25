import { createTRPCRouter } from "./trpc";
import { pinRouter } from "./router/pin";
import { communityRouter } from "./router/community";
import { authRouter } from "./router/auth";

export const appRouter = createTRPCRouter({
  pin: pinRouter,
  community: communityRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
