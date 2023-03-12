import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const commentRouter = createTRPCRouter({
  byPinId: publicProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.comment.findMany({
        where: {
          pinId: input,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          body: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              image: true,
              displayName: true,
            },
          },
        },
      });
    }),
});
