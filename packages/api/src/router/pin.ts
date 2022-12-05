import { z } from "zod";
import { getPlaiceholder } from "plaiceholder";
import { v2 as cloudinary } from "cloudinary";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const pinRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.pin.findMany({
      include: {
        category: true,
        user: { select: { name: true } },
        image: true,
      },
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
  byUser: publicProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.pin.findMany({
        where: {
          userId: input,
        },
        include: { category: true, user: true },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        description: z.string(),
        categoryId: z.string().cuid(),
        userId: z.string().cuid(),
        imgSrc: z.string(),
        imgAlt: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { secure_url: secureURL, public_id: publicId } =
        await cloudinary.uploader.upload(input.imgSrc, {
          // public_id: updatePayload.slug,
          folder: process.env.CLOUDINARY_BASE_PUBLIC_ID || "kenny/pins",
          overwrite: true,
          invalidate: true,
          unique_filename: false,
        });

      const { base64, img } = await getPlaiceholder(input.imgSrc);

      return ctx.prisma.pin.create({
        data: {
          description: input.description,
          category: {
            connect: {
              id: input.categoryId,
            },
          },
          user: {
            connect: {
              id: input.userId,
            },
          },
          image: {
            connectOrCreate: {
              where: {
                src: input.imgSrc,
              },
              create: {
                publicId,
                src: secureURL,
                width: img.width,
                height: img.height,
                blurDataURL: base64,
                alt: input.imgAlt || "Pin image",
              },
            },
          },
        },
        include: { category: true, image: true, user: true },
      });
    }),
});
