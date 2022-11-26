import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const pinRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.pin.findMany();
  }),
  byId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.prisma.pin.findUnique({
      where: {
        id: input,
      },
    });
  }),
});
