import { slugify } from "@badnews/utils";
import { router, publicProcedure } from "../trpc";
import { z } from "zod";

export const postRouter = router({
  byId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.prisma.stash.findUnique({
      where: {
        id: input,
      },
    });
  }),
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.stash.findMany();
  }),
  create: publicProcedure
    .input(
      z.object({
        url: z.string().url(),
        title: z.string(),
        description: z.string(),
        authorEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.stash.create({
        data: {
          url: input.url,
          title: input.title,
          description: input.description,
          slug: slugify(input.title),
          ...(input.authorEmail
            ? {
                author: {
                  connect: {
                    email: input.authorEmail,
                  },
                },
              }
            : undefined),
        },
      });
    }),
  edit: publicProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        url: z.string().url(),
        title: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.stash.update({
        where: {
          id: input.id,
        },
        data: {
          url: input.url,
          title: input.title,
          description: input.description,
          slug: slugify(input.title),
        },
      });
    }),
  delete: publicProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.stash.delete({
        where: {
          id: input,
        },
      });
    }),
});
