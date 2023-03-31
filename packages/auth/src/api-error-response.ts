import type { APIErrorResponse } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isAPIErrorResponse(object: any): object is APIErrorResponse {
  return object.code !== undefined && object.message !== undefined;
}
