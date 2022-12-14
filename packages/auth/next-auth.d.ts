import type { DefaultSession, DefaultUser } from "next-auth";
import type { Role } from "@badnews/db";

/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      /** The user's permissions role. `ADMIN` | `USER`. */
      role: Role;
      image?: {
        src: string;
        publicId: string;
      };
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    /** The user's permissions role. `ADMIN` | `USER`. */
    role: Role;
    accessToken?: string;
    refreshToken?: string;
    image: {
      src: string;
    } | null;
  }
}
