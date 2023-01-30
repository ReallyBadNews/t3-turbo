import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    /**
     * TODO: add color-scheme to the html tag
     * @see https://github.com/tailwindlabs/tailwindcss.com/blob/master/src/pages/_document.js#L18
     */
    <Html lang="en" className="h-full">
      <Head />
      <body className="h-full bg-gray-100 text-gray-700 antialiased dark:bg-gray-900 dark:text-gray-200">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
