import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

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
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),
  pins: publicProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input }) => {
      const pins = await ctx.prisma.pin.findMany({
        where: {
          userId: input,
        },
        include: {
          image: true,
          likedBy: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!pins) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pins not found",
        });
      }

      return pins;
    }),
});
