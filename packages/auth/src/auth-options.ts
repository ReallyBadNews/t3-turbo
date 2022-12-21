import CredentialsProvider from "next-auth/providers/credentials";
import { type NextAuthOptions } from "next-auth";

import { prisma } from "@badnews/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { isAPIErrorResponse } from "./api-error-response";
import type { APIErrorResponse, UserIdentity, UserProfile } from "./types";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Arc Subscriptions",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: {
          label: "Email",
          type: "text",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        const loginRes = await fetch(
          `https://${
            process.env.IDENTITY_SBX as string
          }.cdn.arcpublishing.com/identity/public/v1/auth/login`,
          {
            method: "POST",
            body: JSON.stringify({
              grantType: "password",
              userName: credentials?.username,
              credentials: credentials?.password,
            }),
            headers: { "Content-Type": "application/json" },
          }
        );

        const user = (await loginRes.json()) as APIErrorResponse | UserIdentity;

        console.log("[AUTH] subs user", { user });

        // If no error and we have user data, return it
        if (!isAPIErrorResponse(user)) {
          // find user in db
          let dbUser = await prisma.user.findUnique({
            where: {
              email: credentials?.username,
            },
            include: {
              image: {
                select: {
                  src: true,
                },
              },
            },
          });

          console.log("[AUTH] db user", { dbUser });

          if (dbUser) {
            return {
              ...dbUser,
              accessToken: user.accessToken,
              refreshToken: user.refreshToken,
            };
          }

          // if not found, create user
          // get user info from subs
          const profileRes = await fetch(
            `https://${
              process.env.IDENTITY_SBX as string
            }.cdn.arcpublishing.com/identity/public/v1/profile`,
            {
              headers: {
                Authorization: `Bearer ${user.accessToken}`,
              },
            }
          );

          const userProfile = (await profileRes.json()) as
            | UserProfile
            | APIErrorResponse;

          console.log("[AUTH] subs user profile", { userProfile });

          if (!isAPIErrorResponse(userProfile)) {
            // create user in db
            dbUser = await prisma.user.create({
              data: {
                email: userProfile.email || credentials?.username,
                displayName: userProfile.displayName,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                emailVerified: userProfile.emailVerified,
                status: userProfile.status || "Active",
                // image: userProfile.picture as string,
                role: "USER",
              },
            });

            console.log("[AUTH] subs user created", { dbUser });

            // return user data
            if (dbUser) {
              return {
                ...dbUser,
                accessToken: user.accessToken,
                refreshToken: user.refreshToken,
              };
            }
          }
        }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
    // ...add more providers here
  ],
  secret: process.env.NEXTAUTH_JWT_SECRET,
  session: { strategy: "jwt" },
  // jwt: {},
  callbacks: {
    jwt: ({ token, user, account, isNewUser, profile }) => {
      console.log("[AUTH] jwt", { token, user, account, isNewUser, profile });
      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          id: user.id,
        };
      }

      return token;
    },
    session({ session, token, user }) {
      console.log("[AUTH] session", { session, token, user });
      session.user.accessToken = token.accessToken;
      session.user.refreshToken = token.refreshToken;
      session.user.accessTokenExpires = token.accessTokenExpires;
      session.user.id = token.id;

      return session;
    },
  },
};
