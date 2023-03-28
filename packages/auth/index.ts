import type { Role } from "@badnews/db";
import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

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
      accessToken?: string;
      refreshToken?: string;
      accessTokenExpires: string;
      image?: {
        src: string;
        publicId: string;
      };
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    /** The user's permissions role. `ADMIN` | `USER`. */
    accessToken?: string;
    refreshToken?: string;
    displayName: string | null;
    role: Role;
    image: {
      src: string;
    } | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires: string;
  }
}

export type { Session } from "next-auth";
export { authOptions } from "./src/auth-options";
export { getServerSession } from "./src/get-session";
