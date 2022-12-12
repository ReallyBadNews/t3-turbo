import type { APIErrorResponse } from "./types";

export function isAPIErrorResponse(object: any): object is APIErrorResponse {
  return object.code !== undefined && object.message !== undefined;
}
