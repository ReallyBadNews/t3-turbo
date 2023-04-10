import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    /**
     * TODO: add color-scheme to the html tag
     * @see https://github.com/tailwindlabs/tailwindcss.com/blob/master/src/pages/_document.js#L18
     */
    <Html lang="en" className="h-full">
      <Head />
      {/* <body className="h-full bg-slate-100 text-slate-700 antialiased dark:bg-slate-900 dark:text-slate-50"> */}
      <body className="min-h-screen bg-white font-sans text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
