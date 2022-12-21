import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const communityRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.community.findMany({ orderBy: { name: "asc" } });
  }),
  byId: publicProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.community.findUnique({
        where: {
          id: input,
        },
      });
    }),
});
