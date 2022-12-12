/* eslint-disable no-console */
import { getPlaiceholder } from "plaiceholder";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from ".";

import type { Category, Channel, Comment, Image, Pin } from "@prisma/client";

const DEFAULT_CHANNELS = [
  {
    id: "clazs7e7p000008lfc7u58v32",
    name: "Weather",
    slug: "weather",
    description: "Weather related pins",
  },
] as Channel[];

const DEFAULT_CATEGORRIES = [
  {
    id: "clazr3gtq000008l9dxem9tak",
    name: "Beautiful day",
    slug: "beautiful-day",
    channelId: "clazs7e7p000008lfc7u58v32",
  },
  {
    id: "clazwbnep000008ibe3fz4cuo",
    name: "Thunderstorms",
    slug: "thunderstorms",
    channelId: "clazs7e7p000008lfc7u58v32",
  },
] as Category[];

const DEFAULT_PINS = [
  {
    id: "clazpt55i000008l89d2d4pol",
    administrativeArea: "Michigan",
    country: "United States",
    city: "Detroit",
    latitude: 42.330005282145656,
    longitude: -83.05348303745654,
    description: "This is a description",
    userId: "clbk7u1mh0000qmunws80t8ux",
    categoryId: "clazr3gtq000008l9dxem9tak",
    imageId: "clb179vvh000008icg1v3bk5o",
  },
  {
    id: "clazpteuq000108l88wzw267r",
    administrativeArea: "Michigan",
    country: "United States",
    city: "Rochester",
    latitude: 42.71907152240076,
    longitude: -83.1835650331445,
    description: "Hello world",
    userId: "clbk7u1mh0000qmunws80t8ux",
    categoryId: "clazwbnep000008ibe3fz4cuo",
    imageId: "clb17y7r8000008mm0domeb5t",
  },
  {
    id: "clazq5xxs000007jm7ekufwwq",
    administrativeArea: "Texas",
    country: "United States",
    city: "Houston",
    latitude: 29.690064977995842,
    longitude: -95.5266790802049,
    description: "Hello from KPRC 2",
    userId: "clbk7u1mh0000qmunws80t8ux",
    categoryId: "clazr3gtq000008l9dxem9tak",
  },
  {
    id: "clb08mo7y000208l4arnc2u37",
    administrativeArea: "Florida",
    country: "United States",
    city: "Pembroke Park",
    latitude: 25.985358031040818,
    longitude: -80.17751500968816,
    description: "Hello from KPRC 2",
    userId: "clbk7u1mh0000qmunws80t8ux",
    categoryId: "clazwbnep000008ibe3fz4cuo",
  },
] as Pin[];

const DEFAULT_COMMENTS = [
  {
    id: "clbk8yh7g000008m8hbfr9et4",
    body: "This is a comment",
    pinId: "clb08mo7y000208l4arnc2u37",
    userId: "clbk7u1mh0000qmunws80t8ux",
  },
] as Comment[];

const DEFAULT_IMAGES = [
  {
    id: "clb179vvh000008icg1v3bk5o",
    src: "https://images.unsplash.com/photo-1668622702524-d8917fd37f5e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1335&q=80",
    alt: "Light painting",
  },
  {
    id: "clb17y7r8000008mm0domeb5t",
    src: "https://images.unsplash.com/photo-1668875438649-f26a1a16e148?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1335&q=80",
    alt: "Traffic at night",
  },
  {
    id: "clb17z0x0000008m8g1v3bk5o",
    src: "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    alt: "Profile picture",
  },
] as Image[];

async function main() {
  try {
    for (const image of DEFAULT_IMAGES) {
      const { secure_url: secureURL, public_id: publicId } =
        await cloudinary.uploader.upload(image.src, {
          // public_id: updatePayload.slug,
          folder: process.env.CLOUDINARY_BASE_PUBLIC_ID || "kenny/pins",
          overwrite: true,
          invalidate: true,
          unique_filename: false,
        });

      const { base64, img } = await getPlaiceholder(image.src);
      await prisma.image.upsert({
        where: {
          src: secureURL,
        },
        update: {
          publicId,
          id: image.id,
          src: secureURL,
          alt: image.alt,
          blurDataURL: base64,
          height: img.height,
          width: img.width,
        },
        create: {
          publicId,
          id: image.id,
          src: secureURL,
          alt: image.alt,
          blurDataURL: base64,
          height: img.height,
          width: img.width,
        },
      });
      console.log(`Created image ${image.id}`);
    }

    console.log("Created images");

    for (const channel of DEFAULT_CHANNELS) {
      await prisma.channel.upsert({
        where: { id: channel.id },
        update: channel,
        create: channel,
      });
      console.log(`Created channel ${channel.name}`);
    }

    console.log("Channels created");

    for (const category of DEFAULT_CATEGORRIES) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: category,
        create: category,
      });
      console.log(`Created category ${category.name}`);
    }

    console.log("Categories created");

    for (const pin of DEFAULT_PINS) {
      await prisma.pin.upsert({
        where: { id: pin.id },
        update: pin,
        create: pin,
      });
      console.log(`Created pin with id: ${pin.id}`);
    }

    for (const comment of DEFAULT_COMMENTS) {
      await prisma.comment.upsert({
        where: { id: comment.id },
        update: comment,
        create: comment,
      });
      console.log(`Created comment with id: ${comment.id}`);
    }
    console.log("Done.");
  } catch (error) {
    console.error(error);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
