import { v2 as cloudinary } from "cloudinary";
import { getPlaiceholder } from "plaiceholder";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const pinRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    const pins = await ctx.prisma.pin.findMany({
      select: {
        // count number of likes
        _count: {
          select: { likedBy: true },
        },
        id: true,
        administrativeArea: true,
        country: true,
        description: true,
        latitude: true,
        longitude: true,
        city: true,
        comments: true,
        community: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            image: true,
            displayName: true,
          },
        },
        views: true,
        status: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return pins;
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
        imgSrc: z.string().optional(),
        imgAlt: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cloudinaryResp = input.imgSrc
        ? await cloudinary.uploader.upload(input.imgSrc, {
            // public_id: updatePayload.slug,
            folder: process.env.CLOUDINARY_BASE_PUBLIC_ID || "kenny/pins",
            overwrite: true,
            invalidate: true,
            unique_filename: false,
          })
        : undefined;

      const { secure_url: secureURL, public_id: publicId } =
        cloudinaryResp || {};

      const plaiceholder = secureURL
        ? await getPlaiceholder(secureURL)
        : undefined;

      const { base64, img } = plaiceholder || {};

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
          ...(img && secureURL && publicId && base64
            ? {
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
              }
            : undefined),
        },
        include: { community: true, image: true, user: true },
      });
    }),
  delete: protectedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.pin.delete({
        where: {
          id: input,
        },
      });
    }),
  like: protectedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.pin.update({
        where: {
          id: input,
        },
        data: {
          likedBy: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
        include: {
          likedBy: {
            select: {
              id: true,
            },
          },
        },
      });
    }),
});
