import type { Options } from "@sindresorhus/slugify";
import sidSlugify from "@sindresorhus/slugify";

export const slugify = (text: string, options?: Options): string => {
  return sidSlugify(text, {
    customReplacements: [
      ["TypeScript", "typescript"],
      ["JavaScript", "javascript"],
    ],
    ...options,
  });
};
