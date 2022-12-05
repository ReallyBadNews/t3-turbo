import CredentialsProvider from "next-auth/providers/credentials";
import { type NextAuthOptions } from "next-auth";
// import GithubProvider from "next-auth/providers/github";

import { prisma } from "@badnews/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    // GithubProvider({
    //   clientId: process.env.GITHUB_CLIENT_ID as string,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    // }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Arc Subscriptions",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        const res = await fetch(
          `https://${process.env.IDENTITY_SBX}.cdn.arcpublishing.com/identity/public/v1/auth/login`,
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

        const user = (await res.json()) as {
          accessToken: string;
          refreshToken: string;
          uuid: string;
        };

        console.log("[AUTH] user", user);

        // If no error and we have user data, return it
        if (res.ok && user) {
          return {
            // ...user,
            // name: credentials?.username,
            // email: credentials?.username,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            name: credentials?.username,
            id: user.uuid,
            role: "USER",
          };
        }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
    // ...add more providers here
  ],
  secret: process.env.NEXTAUTH_JWT_SECRET,
  jwt: {},
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user, account }) {
      console.log("[AUTH] jwt", { token, user, account });
      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
        };
      }

      return token;
    },
    session({ session, token }) {
      console.log("[AUTH] session", { session, token });
      session.user.accessToken = token.accessToken;
      session.user.refreshToken = token.refreshToken;
      session.user.accessTokenExpires = token.accessTokenExpires;

      return session;
    },
  },
  // callbacks: {
  //   jwt({ token, user, account, profile, isNewUser }) {
  //     if (account && user) {
  //       return {
  //         ...token,
  //         accessToken: user,
  //       };
  //     }
  //   },
  //   session({ session, user }) {
  //     session.user.id = user.id;
  //     session.user.role = user.role; // Add role value to user object so it is passed along with session
  //     return session;
  //   },
  // },
};
