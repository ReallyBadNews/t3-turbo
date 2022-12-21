import { v2 as cloudinary } from "cloudinary";
import { getPlaiceholder } from "plaiceholder";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const pinRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.pin.findMany({
      include: {
        community: true,
        user: { select: { displayName: true, id: true, image: true } },
        image: true,
        // get the sum of likedBy
        likedBy: {
          select: {
            id: true,
          },
        },
        comments: {
          select: {
            id: true,
          },
        },
      },
    });
  }),
  byId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.prisma.pin.findUnique({
      where: {
        id: input,
      },
      include: { community: true, user: true },
    });
  }),
  byCommunity: publicProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.pin.findMany({
        where: {
          communityId: input,
        },
        include: { community: true, user: true },
      });
    }),
  byUser: publicProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.pin.findMany({
        where: {
          userId: input,
        },
        include: { community: true, user: true },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        description: z.string(),
        communityId: z.string().cuid(),
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
          community: {
            connect: {
              id: input.communityId,
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
        include: { community: true, image: true, user: true },
      });
    }),
});
