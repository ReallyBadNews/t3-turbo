import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  byId: protectedProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input,
        },
        include: {
          image: true,
          _count: {
            select: {
              pins: true,
              likedPins: true,
              comments: true,
              followedBy: true,
              following: true,
            },
          },
          likedPins: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return {
        ...user,
        likedPins: user.likedPins.map((pin) => pin.id),
      };
    }),
});
