import "@total-typescript/ts-reset";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type { AppType } from "next/app";
import { Inter as FontSans } from "next/font/google";

import "../styles/globals.css";

import { Layout } from "../components/Layout";
import { api } from "../utils/api";

// .filter just got smarter!
// const filteredArray = [1, 2, undefined].filter(Boolean); // number[]

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <ThemeProvider attribute="class">
      <SessionProvider session={session}>
        <div className={fontSans.className}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </div>
      </SessionProvider>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
