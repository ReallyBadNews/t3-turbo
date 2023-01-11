import type { AppRouter } from "@badnews/api";
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server";

export type FeedOrder = inferProcedureInput<
  AppRouter["pin"]["infinite"]
>["order"];

export type Pin = inferProcedureOutput<
  AppRouter["pin"]["infinite"]
>["pins"][number];
