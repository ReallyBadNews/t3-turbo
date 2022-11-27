import { prisma } from ".";

import type { Category, Channel, Pin } from "@prisma/client";

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
    userId: "clan79ilb00006lp4j0tf7ytg",
    categoryId: "clazr3gtq000008l9dxem9tak",
  },
  {
    id: "clazpteuq000108l88wzw267r",
    administrativeArea: "Michigan",
    country: "United States",
    city: "Rochester",
    latitude: 42.71907152240076,
    longitude: -83.1835650331445,
    description: "Hello world",
    userId: "clan79ilb00006lp4j0tf7ytg",
  },
  {
    id: "clazq5xxs000007jm7ekufwwq",
    administrativeArea: "Texas",
    country: "United States",
    city: "Houston",
    latitude: 29.690064977995842,
    longitude: -95.5266790802049,
    description: "Hello from KPRC 2",
    userId: "clan79ilb00006lp4j0tf7ytg",
  },
] as Pin[];

async function main() {
  try {
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

// (async () => {
//   try {
//     await Promise.all(
//       DEFAULT_USERS.map((user) =>
//         prisma.user.upsert({
//           where: {
//             email: user.email!,
//           },
//           update: {
//             ...user,
//           },
//           create: {
//             ...user,
//           },
//         })
//       )
//     );
//   } catch (error) {
//     console.error(error);
//     process.exit(1);
//   } finally {
//     await prisma.$disconnect();
//   }
// })();
