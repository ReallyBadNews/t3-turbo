import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const pinRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.pin.findMany({
      include: { category: true, user: true },
    });
  }),
  byId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.prisma.pin.findUnique({
      where: {
        id: input,
      },
      include: { category: true, user: true },
    });
  }),
  byCategory: publicProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.pin.findMany({
        where: {
          categoryId: input,
        },
        include: { category: true, user: true },
      });
    }),
});
